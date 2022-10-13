// type funcType = <T>(preValue: any) => Promise<T>
interface funcType<T> {
    (preValue: T | undefined): Promise<T>
}

/**
 * new ACollector().do((prevalue)=>{console.log(prevalue);return new Promise(r=>r(0)})    //多次执行始终执行一边
 * new ACollector().do((prevalue)=>{console.log(prevalue);return new Promise(r=>r(1)})
 * new ACollector().do((prevalue)=>{console.log(prevalue);return new Promise(r=>r(2)})
 *
 * 最终会统一执行一次 一秒后
 * 1
 * 2
 * 3
 */
export class ACollector {
    private over: boolean = false;
    private timer: undefined | number = undefined;
    private time: number = 1000;
    private tasks: (funcType<any> | null)[] = []
    private preValue: any = undefined
    private static instance: ACollector;

    constructor(time: number = 1000) {
        this.forInstance()
        ACollector.instance.time = time
    }

    private forInstance() {
        if (!ACollector.instance) {
            this.preValue = undefined
            ACollector.instance = this;
        }
        return ACollector.instance
    }


    private collector<T>(task: funcType<T>) {
        ACollector.instance.tasks.push(task)
    }

    private countDown() {
        ACollector.instance.timer = setTimeout(() => {
            if (!ACollector.instance.over) {
                ACollector.instance.tasks.map(i => {
                    if (typeof i === 'function') {
                        setTimeout(async () => {
                            ACollector.instance.preValue = await i.call(this, ACollector.instance.preValue)
                        }, 0)
                    }
                })
            }
            ACollector.instance.over = true
        }, ACollector.instance.time)
    }

    public setTimeCount(time: number) {
        ACollector.instance.time = time
    }

    public do<T>(task: funcType<T>) {
        ACollector.instance.collector<T>(task)
        clearTimeout(ACollector.instance.timer)
        ACollector.instance.countDown()
    }

    public reset() {
        ACollector.instance.over = false
    }

    public reverse() {
        ACollector.instance.tasks = ACollector.instance.tasks.reverse()
    }

    public removeTasks() {
        ACollector.instance.tasks = []
    }
}

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
    console.log(preValue)    //1
    return new Promise(r => {
        r(true)
    })
})
