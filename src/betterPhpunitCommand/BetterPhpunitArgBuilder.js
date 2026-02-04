import escapeStringRegexp from "../Utils/escape-string-regexp"

export class BetterPhpunitArgBuilder {
  directoryOrFiles = []
  suites = []
  groups = []
  args = []

  addDirectoryOrFile(directoryOrFile) {
    this.directoryOrFiles.push(directoryOrFile.replace(/\\/gi, "/"))

    return this
  }

  addSuite(suiteName) {
    this.suites.push(suiteName)

    return this
  }

  addSuites(suiteNames) {
    this.suites.push(...suiteNames)

    return this
  }

  withFilter(filter) {
    this.filter = filter

    return this
  }

  addGroup(group) {
    this.groups.push(group)

    return this
  }

  addGroups(groups) {
    this.groups.push(...groups)

    return this
  }

  withConfig(configFile) {
    this.configFile = configFile.replace(/\\/gi, "/")

    return this
  }

  withColors(color) {
    this.color = color

    return this
  }

  addArgs(args) {
    this.args.push(...args)

    return this
  }

  withPathMappings(pathMappings, workspaceFolder) {
    this.pathMappings = pathMappings
    this.workspaceFolder = workspaceFolder

    return this
  }

  buildArgs() {
    let args = [
      ...(this.configFile ? ["--configuration", this.configFile] : []),
      ...(this.color ? [`--colors=${this.color}`] : []),
      ...(this.suites.length > 0
        ? ["--testsuite", `'${this.suites.join(",")}'`]
        : []),
      ...(this.filter ? ["--filter", `'${this.filter}'`] : []),
      ...(this.groups.length > 0 ? ["--group", this.groups.join(",")] : []),
      ...this.args,
      ...this.directoryOrFiles.map(directoryOrFile => `'${directoryOrFile}'`)
    ].filter(part => part)

    if (this.pathMappings) {
      for (const key of Object.keys(this.pathMappings)) {
        const localPath = key
          .replace(/\$\{workspaceFolder\}/gi, this.workspaceFolder)
          .replace(/\\/gi, "/")
        const remotePath = this.pathMappings[key]

        args = args.map(arg =>
          arg.replace(
            new RegExp(escapeStringRegexp(localPath), "ig"),
            remotePath
          )
        )
      }
    }

    return args.filter(part => part)
  }

  build() {
    return this.buildArgs().join(" ")
  }
}
