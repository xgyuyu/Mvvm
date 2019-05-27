class Observer{
    constructor(data){
        // data..
        this.observe(data)
    }
    observe(data){
        if (typeof data != 'object' || !data) {
            return
        }
        
        // console.log( Object.keys(data))
        Object.keys(data).forEach(key => {
            this.defineResponsive(data, key, data[key])
            this.observe(data[key])
        })
    }
    defineResponsive(data, key, value) {
        let that = this
        let dep = new Dep() // 每个变化的数据都会对应一个数组这个数组是存放所有更新的操作
        Object.defineProperty(data,key, {
            enumerable: true,
            configurable: true,
            get(){
                // 第一次取值的时候没有Dep.target,new watch才有值
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(newValue){
                that.observe(newValue)
                if (newValue !== value) {
                    value = newValue
                }
                // 当值一变化,就调用通知
                dep.tongzhi()
            }
        })
    }
}
class Dep {
    constructor(){
        this.sub = []
    }
    addSub(watch){
        this.sub.push(watch)
    }
    tongzhi(){
        this.sub.forEach(v => v.updated())
    }
}