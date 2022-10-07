/**
 * Copyright 2022 HolyCorn Software
 * 
/**
 * This class allows us to retry an action in such a way that the time between each retry grows multiplicatively 
 */
export default class GrowRetry {

    constructor(action, { maxTime = 10_000, startTime = 100, factor = 2, maxTries = Infinity } = {}) {

        /** @type {function} */
        this.action = action

        /** @type {number} The maximum time for an action*/ this.maxTime = maxTime
        /** @type {number} The delay before making the first action*/ this.startTime = startTime
        /** @type {number} How much the timeouts grow*/ this.factor = factor
        /** @type {number} After this number of attempts the whole process will fail*/ this.maxTries = maxTries

    }

    execute() {
        let currentTime = 0;
        let tries = 0;

        return new Promise((resolve, reject) => {

            const doOnce = () => {
                setTimeout(async () => {
                    try {
                        resolve(await this.action());
                    } catch (e) {
                        if(currentTime === 0){
                            currentTime = this.startTime;
                        }
                        currentTime *= this.factor
                        currentTime = currentTime > this.maxTime ? this.maxTime : currentTime < this.startTime ? this.startTime : currentTime;
                        if (++tries >= this.maxTries) {
                            return reject(e)
                        }
                        doOnce();
                    }
                }, currentTime)
            }

            doOnce();

        })
    }

}
