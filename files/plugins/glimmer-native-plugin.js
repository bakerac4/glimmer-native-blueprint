// const Debug = require('debug');
const Bundle = require('./bundle');
const debug = require('debug')('GlimmerNativePlugin');
module.exports = class GlimmerNativePlugin {

    constructor(options) {
        this.bundle = null;
        this.options = options;
        this.inputPath = this.options.context;
        this.dist = this.options.dist;
        this.outputFile = this.options.output;
        this.resolver = this.options.resolver;
        this.resolverDelegate = this.options.resolverDelegate
        console.error('Plugin constructor');
    }

    async apply(compiler) {
      console.error('applying plugin');
      let inputPath = this.inputPath;
      let dist = this.dist;

        compiler.plugin('this-compilation', (compilation) => {
            console.error('beginning compilation');

            try {
                let bundle = this.bundle = this.getBundleFor(inputPath, dist);
                this.didCompile = bundle.compile();

                this.didCompile.then(() => {
                  compilation.plugin('additional-assets', (cb) => {
                       console.error('adding additional assets');
                       // let { output } = this.options;
                       // console.error(bundle.compilation);
                       const json = JSON.stringify(bundle.compilation.components, null, 2);
                       compilation.assets['components.json'] = {
                         source: function() {
                           return json;
                         },
                         size: function() {
                           return json.length;
                         }
                       };
                       const templateJson = JSON.stringify(bundle.compilation.templates, null, 2);
                       compilation.assets['templates.json'] = {
                         source: function() {
                           return templateJson;
                         },
                         size: function() {
                           return templateJson.length;
                         }
                       }
                       // compilation.assets[output] = bundle.compilation;
                       cb();
                   });
                }, err => compilation.errors.push(err));
            } catch (err) {
                compilation.errors.push(err);
            }
        });
    }

    getBundleFor(inputPath, dist) {
        // let delegate = this.getCompilerDelegateFor(inputPath);
        debug('get bundle for path');
        let { mainPath, plugins } = this.options;

        return new Bundle({
            dist,
            inputPath,
            mainPath,
            plugins
        });
    }

    addTemplates(templates, delegate) {
      templates.forEach(template => {
        this.resolverDelegate.addComponent(template.name, template.handle, template.source, template.capabilities);
      });
    }

    addComponent(components, resolver) {
      componentes.forEach(component => {
        const componentClass = require(component.path);
        this.resolver.addComponent(component.name, componentClass);
      });
    }
    // protected getCompilerDelegateFor(inputPath: string) {
    //   let { mode, CompilerDelegate } = this.options;
    //
    //   if (!CompilerDelegate) {
    //     switch (mode) {
    //       case 'module-unification':
    //         CompilerDelegate = MUCompilerDelegate;
    //         break;
    //       default:
    //         throw new Error(`Unrecognized compiler mode ${mode}`);
    //     }
    //   }
    //
    //   let locator;
    //   if (this.options.mainPath) {
    //     let { mainPath } = this.options;
    //     locator = { module: mainPath, name: 'default' }
    //   }
    //
    //   return new CompilerDelegate!({
    //     projectPath: inputPath,
    //     outputFiles: {
    //       dataSegment: 'table.js',
    //       heapFile: 'templates.gbx'
    //     },
    //     builtins: this.options.builtins,
    //     mainTemplateLocator: locator
    //   });
    // }

  // protected async discoverTemplates() {
  //   let project = new Project(this.options.inputPath);
  //   let readTemplates = [];
  //
  //   for (let specifier in project.map) {
  //     let [type] = specifier.split(':');
  //     if (type === 'template') {
  //       let filePath = join(this.options.inputPath, project.map[specifier]);
  //       readTemplates.push(
  //         Promise.all([
  //           filePath,
  //           readFileAsync(filePath),
  //         ])
  //       );
  //     }
  //   }
  //
  //   let templates = await Promise.all(readTemplates);
  //
  //   await Promise.all(templates.map(([path, templateSource]) => {
  //     return this.add(path, templateSource);
  //   }));
  // }
};
