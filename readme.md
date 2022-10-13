## 帮助你统一管理函数多次执行汇总处理的库
```typescript

new ACollector().do<number>((preValue): Promise<number> => {
    console.log(preValue)    //undefined
    return new Promise<number>((r) => {
        r(0)
    })
})

new ACollector().do<string>((preValue): Promise<string> => {
    console.log(preValue)    //0
    return new Promise(r => {
        r('one')
    })
})

new ACollector().do<boolean>((preValue): Promise<boolean> => {
    console.log(preValue)    //one
    return new Promise(r => {
        r(true)
    })
})

/**
 * 会在1秒后统一执行
 * 打印
 * undefined
 * 0
 * 1
 * do()函数回调函数参数为上一个执行的resolve结果
 * 可以通过setTimeCount()来设置延时
 */
```
## 工作原理
每次do函数执行后都不会立即执行,每调用一次都会生成一个定时器(默认1s)。
当1s内do函数再次被调用时则清除上一个定时器重新记时,直到时间结束后
才会统一的执行所有do的回调,注意回调需要返回promise。
当需要重新使用时,需要调用reset()来恢复状态
