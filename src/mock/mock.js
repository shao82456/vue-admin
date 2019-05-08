import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { loginUsers, tasks } from './data/user';
let _tasks = tasks;

export default {
  /**
   * mock bootstrap
   */
  bootstrap() {
    let mock = new MockAdapter(axios);

    // mock success request
    mock.onGet('/success').reply(200, {
      msg: 'success'
    });

    // mock error request
    mock.onGet('/error').reply(500, {
      msg: 'failure'
    });

    //登录
    mock.onPost('/login').reply(config => {
      let {username, password} = JSON.parse(config.data);
      return new Promise((resolve, reject) => {
        let user = null;
        setTimeout(() => {
          let hasUser = loginUsers.some(u => {
            if (u.name === username && u.password === password) {
              user = JSON.parse(JSON.stringify(u));
              user.password = undefined;
              return true;
            }
          });

          if (hasUser) {
            resolve([200, { code: 200, msg: '请求成功', user }]);
          } else {
            resolve([200, { code: 500, msg: '账号或密码错误' }]);
          }
        }, 1000);
      });
    });

    //获取用户列表
    mock.onGet('/user/list').reply(config => {
      let {name} = config.params;
      let mockUsers = _tasks.filter(user => {
        if (name && user.name.indexOf(name) == -1) return false;
        return true;
      });
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            users: mockUsers
          }]);
        }, 1000);
      });
    });

    mock.onGet('/help/cronTime').reply(config => {
      let {cron}=config.params;
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            code: 200,
            data:["2019-05-09 00:00:00","2019-05-10 00:00:00","2019-05-11 00:00:00","2019-05-12 00:00:00","2019-05-13 00:00:00"]
          }]);
        }, 1000);
      });
    });

    //获取用户列表（分页）
    mock.onGet('/task/list').reply(config => {
      let {pageNum} = config.params;
      let total = tasks.length;
      let mockTasks = tasks.filter((u, index) => index < 12 * pageNum && index >= 12 * (pageNum - 1));
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            total: total,
            tasks: mockTasks
          }]);
        }, 1000);
      });
    });

    mock.onGet('/task/:id').reply(config => {
      alert(id)
      console.log("hehe")
    });

    //删除用户
    mock.onGet('/user/remove').reply(config => {
      let { id } = config.params;
      _tasks = _tasks.filter(u => u.id !== id);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            code: 200,
            msg: '删除成功'
          }]);
        }, 500);
      });
    });

    //批量删除用户
    mock.onGet('/user/batchremove').reply(config => {
      let { ids } = config.params;
      ids = ids.split(',');
      _tasks = _tasks.filter(u => !ids.includes(u.id));
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            code: 200,
            msg: '删除成功'
          }]);
        }, 500);
      });
    });

    //编辑用户
    mock.onPost('/task/update').reply(config => {
      alert(config.data);
      // let { id, name, addr, age, birth, sex } = config.params;
      // _tasks.some(u => {
      //   if (u.id === id) {
      //     u.name = name;
      //     u.addr = addr;
      //     u.age = age;
      //     u.birth = birth;
      //     u.sex = sex;
      //     return true;
      //   }
      // });
      // return new Promise((resolve, reject) => {
      //   setTimeout(() => {
      //     resolve([200, {
      //       code: 200,
      //       msg: '编辑成功'
      //     }]);
      //   }, 500);
      // });
    });

    //新增任务
    mock.onPost('/task/add').reply(config => {
      let { name, command, cron, status, descript } = JSON.parse(config.data);
      alert(config.data);
      _tasks.push({
        uid:100,
        name: name,
        command:command,
        cron: cron,
        status: status,
        descript: descript
      });
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([200, {
            code: 200,
            msg: '新增成功'
          }]);
        }, 500);
      });
    });

  }
};
