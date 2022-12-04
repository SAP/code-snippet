import { IChildLogger } from "@vscode-logging/logger";
import _ = require("lodash");

export type ISWATracker = {
  track: (
    eventType: string,
    customEvents?: string[] | undefined,
    numericEvents?: number[] | undefined
  ) => void;
};

const SWA_NOOP: ISWATracker = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- leave args for reference
  track(eventType: string, customEvents?: string[]): void {
    return;
  },
};

/**
 * A Simple Wrapper to hold the state of our "singleton" (per extension) SWATracker
 * implementation.
 */

export class SWA {
  private static readonly CODE_SNIPPET = "Code Snippet";

  // Event types used by code snippet
  private static readonly EVENT_TYPES = {
    SNIPPET_CREATION_STARTED: "Snippet creation started",
    SNIPPET_CREATION_SUCCESSFULLY: "Snippet creation successfully",
    SNIPPET_CREATION_FAILED: "Snippet creation failed",
  };

  private static swaTracker: ISWATracker;
  private static startTime: number = Date.now();

  private static isInitialized(): boolean {
    return !_.isUndefined(SWA.swaTracker);
  }

  private static initSWATracker(newSwaTracker: ISWATracker) {
    SWA.swaTracker = newSwaTracker;
  }

  /**
   * Note the use of a getter function so the value would be lazy resolved on each use.
   * This enables concise and simple consumption of the swaTracker throughout our Extension.
   *
   * @returns { SWATracker }
   */
  public static getSWATracker(): ISWATracker {
    if (SWA.isInitialized() === false) {
      return;
    }
    return SWA.swaTracker;
  }

  public static createSWATracker(logger?: IChildLogger): void {
    try {
      // Update the swa-tracker-wrapper with a reference to the swaTracker.
      SWA.initSWATracker(SWA_NOOP);
      if (logger) {
        logger.info(
          `SAP Web Analytics tracker was created for ${SWA.CODE_SNIPPET}`
        );
      }
    } catch (error) {
      logger.error(error);
    }
  }

  public static updateSnippetStarted(
    snippetName: string,
    logger?: IChildLogger
  ): void {
    try {
      if (SWA.isInitialized()) {
        const eventType = SWA.EVENT_TYPES.SNIPPET_CREATION_STARTED;
        const customEvents = [snippetName];
        SWA.startTime = Date.now();
        SWA.getSWATracker().track(eventType, customEvents);
        if (logger) {
          logger.trace(
            "SAP Web Analytics tracker was called and start time was initialized",
            {
              eventType,
              snippetName,
              startTime: SWA.startTime,
              customEvents,
            }
          );
        }
      }
    } catch (error) {
      logger.error(error);
    }
  }

  public static updateSnippetEnded(
    snippetName: string,
    isSucceeded: boolean,
    logger?: IChildLogger,
    errorMessage?: string
  ): void {
    try {
      if (SWA.isInitialized()) {
        const eventType = isSucceeded
          ? SWA.EVENT_TYPES.SNIPPET_CREATION_SUCCESSFULLY
          : SWA.EVENT_TYPES.SNIPPET_CREATION_FAILED;

        const endTime = Date.now();
        const creationTimeMilliSec = endTime - SWA.startTime;
        const creationTimeSec = Math.round(creationTimeMilliSec / 1000);
        const customEvents = [snippetName, creationTimeSec.toString()];
        if (!_.isNil(errorMessage)) {
          customEvents.push(errorMessage);
        }
        SWA.getSWATracker().track(eventType, customEvents);
        if (logger) {
          logger.trace("SAP Web Analytics tracker was called", {
            eventType,
            snippetName,
            creationTimeSec,
            creationTimeMilliSec,
            endTime,
            startTime: SWA.startTime,
            customEvents,
            errorMessage,
          });
        }
      }
    } catch (error) {
      logger.error(error);
    }
  }
}
