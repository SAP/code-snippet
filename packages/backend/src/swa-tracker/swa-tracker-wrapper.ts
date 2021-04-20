import { SWATracker } from "@sap/swa-for-sapbas-vsx";
import { IChildLogger } from "@vscode-logging/logger";
import _ = require("lodash");

// eslint-disable-next-line @typescript-eslint/no-var-requires -- legacy code
const jsonPackage = require("./../../package.json");

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

  private static swaTracker: SWATracker;
  private static startTime: number = Date.now();

  private static isInitialized(): boolean {
    return !_.isUndefined(SWA.swaTracker);
  }

  private static initSWATracker(newSwaTracker: SWATracker) {
    SWA.swaTracker = newSwaTracker;
  }

  /**
   * Note the use of a getter function so the value would be lazy resolved on each use.
   * This enables concise and simple consumption of the swaTracker throughout our Extension.
   *
   * @returns { SWATracker }
   */
  public static getSWATracker(): SWATracker {
    if (SWA.isInitialized() === false) {
      return;
    }
    return SWA.swaTracker;
  }

  public static createSWATracker(logger?: IChildLogger): void {
    try {
      const swaTracker = new SWATracker(
        jsonPackage.publisher,
        jsonPackage.name,
        // callback for error, one such callback for all the errors we receive via all the track methods
        // error can be string (err.message) or number (response.statusCode)
        (error: string | number) => {
          if (logger) {
            if (typeof error === "string") {
              logger.error("SAP Web Analytics tracker failed to track", {
                errorMessage: error,
              });
            } else if (typeof error === "number") {
              // bug in matomo-tracker: they think that success is 200 or 30[12478], so we are rechecking here
              if (
                !(error >= 200 && error <= 299) &&
                !(error >= 300 && error <= 399)
              ) {
                logger.error("SAP Web Analytics tracker failed to track", {
                  statusCode: error,
                });
              }
            }
          }
        }
      );

      // Update the swa-tracker-wrapper with a reference to the swaTracker.
      SWA.initSWATracker(swaTracker);
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
