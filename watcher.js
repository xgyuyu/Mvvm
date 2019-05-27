class Watcher {
    constructor(vm, expr,cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        this.value = this.get()
    }
    getVal(vm,expr){
        expr = expr.split('.')
        return expr.reduce((prev,next) => {
            return prev[next]
        },vm.$data)
    }
    get() {
        // 把DEp的this放过去,this是当前watch
        // 我们在编译赋值的时候new Watch,就产生了实力,实例赋给了Dep.target属性
        Dep.target = this
        let value = this.getVal(this.vm,this.expr)
        // 用完在去掉
        Dep.target = null
        return value
    }
    updated() {
        let newValue = this.getVal(this.vm,this.expr)
        let oldValue = this.value
        if(newValue != oldValue){
            this.cb(newValue)
        }
    }
}


