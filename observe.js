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
        Object.defineProperty(data,key, {
            enumerable: true,
            configurable: true,
            get(){
                return value
            },
            set(newValue){
                that.observe(newValue)
                if (newValue !== value) {
                    value = newValue
                }
            }
        })
    }
}