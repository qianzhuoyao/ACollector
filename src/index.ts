// type funcType = <T>(preValue: any) => Promise<T>
interface funcType<T> {
    (preValue: T | undefined,): Promise<T>
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
    private pending: boolean = false
    private static instance: ACollector;

    constructor(time: number = 1000) {
        this.forInstance()
        ACollector.instance.time = time
    }

    /**
     * 单例
     * @private
     */
    private forInstance() {
        if (!ACollector.instance) {
            this.preValue = undefined
            ACollector.instance = this;
        }
        return ACollector.instance
    }

    /**
     * 收集待执行的任务
     * @param task
     * @private
     */
    private collector<T>(task: funcType<T>) {
        ACollector.instance.tasks.push(task)
    }

    /**
     * 任务执行倒计时
     * @private
     */
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
            ACollector.instance.pending = false
        }, ACollector.instance.time)
    }

    /**
     * 重置自动执行倒计时
     * @param time
     */
    public setTimeCount(time: number): ACollector {
        if (ACollector.instance.isPending()) {
            throw new Error('dont change TimeOut in pending status')
        }
        ACollector.instance.time = time
        return ACollector.instance
    }

    /**
     * 当前任务是否执行完毕
     */
    public isOver(): boolean {
        return this.over
    }

    /**
     * 任务是否已经开始
     */
    public isPending(): boolean {
        return this.pending
    }

    /**
     * 开始注册任务
     * @param task
     */
    public do<T>(task: funcType<T>): ACollector {
        ACollector.instance.pending = true
        ACollector.instance.collector<T>(task)
        clearTimeout(ACollector.instance.timer)
        ACollector.instance.countDown()
        return ACollector.instance
    }

    /**
     * 重置结束状态
     */
    public reset(): ACollector {
        ACollector.instance.over = false
        return ACollector.instance
    }

    /**
     * 任务队列转化为任务栈
     */
    public reverse(): ACollector {
        if (ACollector.instance.isPending()) {
            throw new Error('dont change TimeOut in pending status')
        }
        ACollector.instance.tasks = ACollector.instance.tasks.reverse()
        return ACollector.instance
    }

    /**
     * 清除任务
     */
    public removeTasks(): ACollector {
        if (ACollector.instance.isPending()) {
            throw new Error('dont change TimeOut in pending status')
        }
        ACollector.instance.tasks = []
        return ACollector.instance
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
    console.log(preValue)    //one
    return new Promise(r => {
        r(true)
    })
})
