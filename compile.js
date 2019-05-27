class Compile{
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm
        if (this.el) {
            // 1，先把dom放到内存中
            let fragment = this.nodeFragment(this.el)
            // console.log(fragment)
            // 2 编译
            this.compile(fragment)
            // 3把编译之后的放到元素中
            this.el.appendChild(fragment)
        }
    }
    isElementNode(node) {
        return node.nodeType === 1
    }
    compileElement(node) {
        let attrs = node.attributes
        Array.from(attrs).forEach(attr => {
            let name = attr.name
            if (name.includes('v-')) {
                let expr = attr.value
                let [,type] = name.split('-')
                lib[type](node,this.vm,expr)
            }
        })
        // let attrs = node.attributes
    }
    compileText(text) {
        let expr = text.textContent
        // console.log(expr)
        let reg = /{\{([^}]+)\}\}/g
        if(reg.test(expr)){
			// node this.vm.$data
            // CompileUtil['text'](node,this.vm,expr)
            lib['text'](text,this.vm,expr)
		}
    }
    compile(fragment){
        let childNode = fragment.childNodes
        Array.from(childNode).forEach(node => {
            // 递归
            if(this.isElementNode(node)) {

                this.compileElement(node)
				this.compile(node)
            } else {

                this.compileText(node)
            }
        })
    }
    nodeFragment(el) {
        let fragment = document.createDocumentFragment()
        let firstChild
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment
    }
}
lib = {
    getVal(vm,expr){
        expr = expr.split('.')
        return expr.reduce((prev,next) => {
            return prev[next]
        },vm.$data)
    },
    model(node,vm,expr){
        let updateFn = this.updater['modelUpdater']
        new Watcher(vm,expr,()=>{
			// 当值变化后会调用cb 将新的值传递过来
			updateFn && updateFn(node,this.getVal(vm,expr))
		})
        updateFn && updateFn(node, this.getVal(vm,expr))
    },
    text(node,vm,expr) {
        let reg = /{\{([^}]+)\}\}/g
        let updateFn = this.updater['textUpdater']
        let value = expr.replace(reg, (...arguments) => {
            return this.getVal(vm,arguments[1])
        })
        expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
			// return this.getVal(vm,arguments[1])
			new Watcher(vm,arguments[1],()=>{
				// 如果数据变化了,文本节点需要重新获取依赖的数据更新文本的内容
				updateFn && updateFn(node,expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
                    return this.getVal(vm,arguments[1])
                })(vm,expr))
			})
		})
        updateFn && updateFn(node,value)

    },
    updater: {
        modelUpdater(node,value) {
            node.value = value
        },
        textUpdater(node,value) {
            node.textContent = value
        }
    }
}