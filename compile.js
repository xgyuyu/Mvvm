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
    setModelVal(vm,expr,newVal){
        // a.b
        expr = expr.split('.')
        // 渠道最后一项就应该赋值了
        return expr.reduce((prev, next, currentIndex) => {
            if (currentIndex === expr.length - 1){
                return prev[next] = newVal
            }
            return prev[next] // 取值
        },vm.$data)
    },
    model(node,vm,expr){
        let updateFn = this.updater['modelUpdater']
        new Watcher(vm,expr,()=>{
			// 当值变化后会调用cb 将新的值传递过来
			updateFn && updateFn(node,this.getVal(vm,expr))
        })
        node.addEventListener('input',(e)=>{
            let newVal = e.target.value
            // 把新的值赋值给vm对应的expr
            this.setModelVal(vm,expr,newVal)
        })
        updateFn && updateFn(node, this.getVal(vm,expr))
    },
    getTextVal(vm, expr){
        return expr.replace(/{\{([^}]+)\}\}/g, (...arguments)=>{
            return this.getVal(vm, arguments[1])
        })
    },
    text(node,vm,expr) {
        let reg = /{\{([^}]+)\}\}/g
        let updateFn = this.updater['textUpdater']
        let value = expr.replace(reg, (...arguments) => {
            return this.getVal(vm,arguments[1])
        })
        expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
			// return this.getVal(vm,arguments[1])
			new Watcher(vm,arguments[1],(newValue)=>{
				// 如果数据变化了,文本节点需要重新获取依赖的数据更新文本的内容
				updateFn && updateFn(node,this.getTextVal(vm,expr))
			})
		})
		

		updateFn && updateFn(node,value)

    },
    /* getTextVal(vm,expr){
		return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
			return this.getVal(vm,arguments[1])
		})
	},
	// 文本处理 更新视图文本
	text(node,vm,expr){
		let updateFn = this.updater['textUpdater']
		// {{message}} 替换
		let value = this.getTextVal(vm,expr)

		expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
			// return this.getVal(vm,arguments[1])
			new Watcher(vm,arguments[1],(newValue)=>{
				// 如果数据变化了,文本节点需要重新获取依赖的数据更新文本的内容
				updateFn && updateFn(node,this.getTextVal(vm,expr))
			})
		})
		updateFn && updateFn(node,value)
	}, */
    updater: {
        modelUpdater(node,value) {
            node.value = value
        },
        textUpdater(node,value) {
            node.textContent = value
        }
    }
}