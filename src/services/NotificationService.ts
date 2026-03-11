import { logger } from "./Logger";

export async function notify(message: string) {

  logger.info(`NOTIFICATION: ${message}`)

}