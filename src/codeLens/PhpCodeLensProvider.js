import { CodeLens, Range } from "vscode"
import { Engine } from "php-parser"

let lastDocumentText
let lastCodeLenses = []

export class PhpCodeLensProvider {
  provideCodeLenses(document, token) {
    if (document.getText() === lastDocumentText) {
      return lastCodeLenses
    }

    const engine = new Engine({
      ast: {
        withPositions: true
      },
      parser: {
        debug: false,
        extractDoc: true,
        suppressErrors: true
      },
      lexer: {
        all_tokens: false,
        comment_tokens: true,
        mode_eval: false,
        asp_tags: false,
        short_tags: true
      }
    })

    const ast = engine.parseCode(document.getText(), document.fileName)

    const codeLenses = []

    for (const node of ast.children) {
      if (node.kind === "class") {
        codeLenses.push(...this.parseClass(node))
      } else if (node.kind === "namespace") {
        codeLenses.push(...this.parseNamespace(node))
      }
    }

    for (const codeLens of codeLenses) {
      codeLens.command.arguments[0].addDirectoryOrFile(document.fileName)
    }

    lastDocumentText = document.getText()
    lastCodeLenses = codeLenses

    return codeLenses
  }

  parseNamespace(node) {
    const codeLenses = []

    for (const child of node.children) {
      if (child.kind === "class") {
        codeLenses.push(...this.parseClass(child))
      }
    }

    return codeLenses
  }

  parseClass(node) {
    const codeLenses = []

    for (const child of node.body) {
      if (child.kind !== "method") {
        continue
      }

      const codeLens = this.parseMethod(child)
      if (codeLens) {
        codeLenses.push(codeLens)
      }
    }

    if (codeLenses.length > 0) {
      const classCodeLensRange = new Range(
        node.loc.start.line - 1,
        0,
        node.loc.start.line - 1,
        0
      )
      const className =
        typeof node.name === "string" ? node.name : node.name.name

      codeLenses.push(
        new CodeLens(classCodeLensRange, {
          command: "better-phpunit.run",
          title: "Run tests",
        })
      )
    }

    return codeLenses
  }

  parseMethod(node) {
    const leadingComments = node.leadingComments || []
    const hasTestAnnotation = leadingComments.find(comment => {
      return (
        comment.kind === "commentblock" &&
        comment.value.indexOf("* @test") != -1
      )
    })

    const methodName =
      typeof node.name === "string" ? node.name : node.name.name

    if (!methodName.startsWith("test") && !hasTestAnnotation) {
      return null
    }

    const codeLensRange = new Range(
      node.loc.start.line - 1,
      0,
      node.loc.start.line - 1,
      0
    )

    return new CodeLens(codeLensRange, {
      command: "better-phpunit.run",
      title: "Run test",
    })
  }
}
