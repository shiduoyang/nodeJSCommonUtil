import cron from 'node-cron';

function showUseage() {
  cron.schedule('1,*,*,*,*', (now: Date | 'manual' | 'init') => {
    console.log(now);
  });

  // crontab表达式
  // minutes,hour,day,month,weekday
  // '5,4,1,1,1' means: 1月1号的4点5分并且这一天是星期一
  cron.schedule('1,2,4,5 * * * *', () => {
    console.log('running every minute 1, 2, 4 and 5');
  });

  cron.schedule('*/2 * * * *', () => {
    console.log('running a task every two minutes');
  });

  cron.schedule('1-5 * * * *', () => {
    console.log('running every minute to 1 from 5');
  });

  cron.schedule('*/2 * * * *', () => {
    console.log('running a task every two minutes');
  });

  cron.schedule('* * * January,September Sunday', () => {
    console.log('running on Sundays of January and September');
  });

  cron.schedule('0 1 * * *', () => {
    console.log('Running a job at 01:00 at America/Sao_Paulo timezone');
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });
}

function startAndStopOneTask() {
  var task = cron.schedule('* * * * *', () => {
    console.log('stopped task');
  }, {
    scheduled: false
  });
  task.start();
  task.stop();
}

function test() {
  let task = cron.schedule('* * * * *', () => {
    console.log('task called each minute');
  });
  task.start();
}
test();