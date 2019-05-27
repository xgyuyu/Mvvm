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
        let value = this.getVal(this.vm,this.expr)
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