const readFile = require('fs').readFile;
const join = require('path').join;
const Debug = require('debug');
const precompile = require('@glimmer/compiler').precompile;
const Component = require('@glimmer/opcode-compiler').Component;
const TEMPLATE_ONLY_COMPONENT = require('@glimmer/runtime').TEMPLATE_ONLY_COMPONENT;
const Project = require('glimmer-analyzer').Project;

// const debug = Debug('glimmer-compiler-webpack-plugin:bundle');


// import BinarySource from './binary-source';
// import BundlePlugin from './plugin';

const readFileAsync = function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    readFile(filePath, { encoding: 'utf8' }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

// const Compilable = function Compilable(source) {
//     console.log('In Compilable: ' + source);
//     const precompiled = precompile(source);
//     console.log(`Precompiled: ${JSON.stringify(precompiled)}`);
//     const component = Component(precompiled)
//     console.log(`Compiled Component: ${JSON.stringify(component)}`);
//     return component;
// }

/**
 * A Bundle encapsulates the compilation of multiple Glimmer templates into a
 * final compiled binary bundle. After creating a new Bundle, add one or more
 * components with `add()`. Once all components have been added to the bundle,
 * compile and produce a binary output by calling `compile()`.
 */
module.exports = class Bundle {

  constructor(options) {
    this.options = options;
    this.templates = [];
    this.components = [];

    this.componentCapabilities = {
      attributeHook: true,
      createArgs: true,
      createCaller: false,
      createInstance: true,
      dynamicLayout: false,
      dynamicScope: false,
      dynamicTag: true,
      elementHook: true,
      prepareArgs: false,
      updateHook: true,
      wrapped: false
    };

    this.templateOnlyCapabilities = TEMPLATE_ONLY_COMPONENT;
  }

  async addTemplate(specifier, location, path, templateSource) {
    const length = this.templates.length;
    const nameArray = path.split("/");
    const name = nameArray[nameArray.length -2];
    this.templates.push({
      name,
      source: precompile(templateSource),
      handle: length,
      capabilities: this.componentCapabilities
    });
  }

  async addComponent(specifier, location) {
    const length = this.components.length;
    const componentLocation = join(this.options.dist, location);
    const nameArray = componentLocation.split("/");
    const name = nameArray[nameArray.length -2];

    console.log(location);
    this.components.push({
      name,
      capabilities: this.componentCapabilities,
      location: location,
      handle: length,
      hasSymbolTable: true
    });
  }
  //
  // async addAST(absoluteModulePath: string, ast: AST.Program) {
  //   debug('adding template as AST; path=%s', absoluteModulePath);
  //
  //   let locator = this.templateLocatorFor(absoluteModulePath);
  //   let template = TemplateCompiler.compile({ meta: locator }, ast)
  //   let block = template.toJSON();
  //
  //   let compilable = CompilableTemplate.topLevel(block, this.bundleCompiler.compileOptions(locator));
  //   this.bundleCompiler.addCompilableTemplate(locator, compilable);
  // }
  //
  // protected async collectASTPluginsFor(locator: TemplateLocator<TemplateMeta>): Promise<ASTPluginBuilder[]> {
  //   let astPlugins = await Promise.all(this.plugins.map(plugin => {
  //     return Promise.resolve(plugin.astPluginsFor(locator));
  //   }));
  //
  //   return astPlugins.reduce<ASTPluginBuilder[]>((allPlugins, plugins) => {
  //     return [...allPlugins, ...plugins];
  //   }, []);
  // }

  // protected templateLocatorFor(absoluteModulePath) {
  //   let normalizedPath = this.delegate.normalizePath(absoluteModulePath);
  //   return this.delegate.templateLocatorFor({ module: normalizedPath, name: 'default' });
  // }

  async compile() {
    // debug('beginning bundle compilation');

    await this.discoverTemplates();
    this.discoverComponents();

    // debug('completed bundle compilation');

    this.compilation = {
      templates: this.templates,
      components: this.components
    };

    return this.compilation;
  }

  discoverComponents() {
    let project = new Project(this.options.inputPath);
    let readComponents = [];

    for (let specifier in project.map) {
      let [type] = specifier.split(':');
      if (type === 'component') {
        this.addComponent(specifier, project.map[specifier]);
      }
    }
  }

  async discoverTemplates() {
    let project = new Project(this.options.inputPath);
    let readTemplates = [];

    for (let specifier in project.map) {
      let [type] = specifier.split(':');
      if (type === 'template') {
        let filePath = join(this.options.inputPath, project.map[specifier]);
        readTemplates.push(
          Promise.all([
            specifier,
            project.map[specifier],
            filePath,
            readFileAsync(filePath),
          ])
        );
      }
    }

    let templates = await Promise.all(readTemplates);

    await Promise.all(templates.map(([specifier, location, path, source]) => {
      return this.addTemplate(specifier, location, path, source);
    }));
  }
}
