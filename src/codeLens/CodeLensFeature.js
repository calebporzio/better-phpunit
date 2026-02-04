import { workspace, languages } from "vscode"
import { PhpCodeLensProvider } from "./PhpCodeLensProvider"

let phpCodeLensProvider

export function addCodeLensFeature(context) {
  const codeLensEnabled = workspace
    .getConfiguration("better-phpunit")
    .get("codeLens.enabled")
  if (codeLensEnabled) {
    enableCodeLens(context)
  }

  workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration("better-phpunit.codeLens.enabled")) {
      const codeLensEnabled = workspace
        .getConfiguration("better-phpunit")
        .get("codeLens.enabled")
      if (codeLensEnabled) {
        enableCodeLens(context)
      } else {
        disableCodeLens(context)
      }
    }
  })
}

function enableCodeLens(context) {
  if (phpCodeLensProvider) {
    return
  }

  phpCodeLensProvider = languages.registerCodeLensProvider(
    {
      language: "php",
      scheme: "file",
      pattern: "**/[tT]est*/**/*.php"
    },
    new PhpCodeLensProvider()
  )
  context.subscriptions.push(phpCodeLensProvider)
}

function disableCodeLens(context) {
  if (!phpCodeLensProvider) {
    return
  }

  const phpCodeLensProviderIdx = context.subscriptions.indexOf(
    phpCodeLensProvider
  )
  context.subscriptions.splice(phpCodeLensProviderIdx, 1)
  phpCodeLensProvider.dispose()
  phpCodeLensProvider = null
}
