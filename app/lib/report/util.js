import { captureMessage, captureException } from '@sentry/electron'

export function reportAndReject (err) {
  report(err)
  return Promise.reject(err)
}

export function report (err) {
  if (typeof err === 'string') {
    captureMessage(err)
  } else {
    captureException(err)
  }
}
