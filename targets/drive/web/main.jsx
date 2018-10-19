/* global __DEVELOPMENT__, cozy */

import 'babel-polyfill'

import 'drive/styles/main'

import 'whatwg-fetch'
import React from 'react'
import { render } from 'react-dom'
import { Router, hashHistory } from 'react-router'
import { I18n, initTranslation } from 'cozy-ui/react/I18n'
import CozyClient, { CozyProvider } from 'cozy-client'
import { shouldEnableTracking, getTracker } from 'cozy-ui/react/helpers/tracker'
import { configureReporter } from 'drive/lib/reporter'

import AppRoute from 'drive/web/modules/navigation/AppRoute'
import configureStore from 'drive/store/configureStore'
import { schema } from '../doctypes'

if (__DEVELOPMENT__) {
  // Enables React dev tools for Preact
  // Cannot use import as we are in a condition
  require('preact/devtools')

  // Export React to window for the devtools
  window.React = React
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[role=application]')
  const data = root.dataset

  const protocol = window.location ? window.location.protocol : 'https:'
  const cozyUrl = `${protocol}//${data.cozyDomain}`

  configureReporter()

  const client = new CozyClient({
    uri: cozyUrl,
    token: data.cozyToken,
    schema
  })

  cozy.client.init({
    cozyURL: cozyUrl,
    token: data.cozyToken
  })

  cozy.bar.init({
    appName: data.cozyAppName,
    appEditor: data.cozyAppEditor,
    iconPath: data.cozyIconPath,
    lang: data.cozyLocale,
    replaceTitleOnMobile: false
  })

  let history = hashHistory
  if (shouldEnableTracking() && getTracker()) {
    let trackerInstance = getTracker()
    history = trackerInstance.connectToHistory(hashHistory)
    trackerInstance.track(hashHistory.getCurrentLocation()) // when using a hash history, the initial visit is not tracked by piwik react router
  }

  const polyglot = initTranslation(data.cozyLocale, lang =>
    require(`drive/locales/${lang}`)
  )

  const store = configureStore(client, polyglot.t.bind(polyglot))

  render(
    <I18n lang={data.cozyLocale} polyglot={polyglot}>
      <CozyProvider store={store} client={client}>
        <Router history={history} routes={AppRoute} />
      </CozyProvider>
    </I18n>,
    root
  )
})
