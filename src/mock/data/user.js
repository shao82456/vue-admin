import Mock from 'mockjs';
const loginUsers = [
  {
    name: 'admin',
    password: 'admin',
    avatar: 'https://raw.githubusercontent.com/taylorchen709/markdown-images/master/vueadmin/user.png',
  }
];

const tasks = [];

for (let i = 0; i < 86; i++) {
  tasks.push(Mock.mock({
    uid: Mock.Random.getuid(),
    name: Mock.Random.cname(),
    descript:'test',
    cron:'0 0  * *  * ? ',
    status:0
  }));
}

export { loginUsers, tasks };
