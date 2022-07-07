class Scheduler {
    constructor(capacity) {
      this.capacity = capacity;
      this.queue = [];
      this.runningTaskCount = 0;
    }
 
    async addTasks(tasks, callback) {
        this.queue.push(...tasks);
        this.callback = callback;

        while(this.queue.length && this.runningTaskCount < this.capacity) {
            this.runningTaskCount++;
            const first = this.queue.shift();
            this.execute(first);
        };
    }
   
    execute(task) {
      task().then(() => {
        this.runningTaskCount--;
       
        if(this.queue.length) {
          const first = this.queue.shift();
          this.execute(first);
          this.runningTaskCount++;
        }

        if(!this.queue.length && !this.runningTaskCount) {
            this.callback("Done")
        }
      })
    }
}


module.exports = {Scheduler}