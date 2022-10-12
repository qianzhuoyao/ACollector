type funcType = (preValue: any) => any

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
    private tasks: (funcType | null)[] = []
    private preValue: any = undefined
    private static instance: ACollector;

    constructor(time: number) {
        ACollector.instance.time = time
        this.forInstance()
    }

    private forInstance() {
        if (!ACollector.instance) {
            ACollector.instance = this;
        }
        return ACollector.instance
    }


    private collector(task: funcType) {
        ACollector.instance.tasks.push(task)
    }

    private countDown() {
        ACollector.instance.timer = window.setTimeout(() => {
            if (!ACollector.instance.over) {
                ACollector.instance.tasks.map(async i => {
                    if (typeof i === 'function') {
                        ACollector.instance.preValue = await i.call(this, ACollector.instance.preValue)
                    }
                })
            }
            ACollector.instance.over = true
        }, ACollector.instance.time)
    }

    public setTimeCount(time: number) {
        ACollector.instance.time = time
    }

    public do(task: funcType) {
        ACollector.instance.collector(task)
        window.clearTimeout(ACollector.instance.timer)
        ACollector.instance.countDown()
    }

    public reset() {
        ACollector.instance.over = false
    }
}
