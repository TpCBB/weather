/************** 注意：此文件中的代码，不要做任何修改 ****************/
import { config } from "./config.js";
import axios from "axios";

// 导入 dayjs 模块
import dayjs from "dayjs";
// 导入 dayjs 插件
import weekday from 'dayjs/plugin/weekday'
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"

// 农历日期
import lunarFun from 'lunar-fun'

// 使用 dayjs 插件
dayjs.extend(weekday)
dayjs.extend(isSameOrAfter);

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const axiosPost = function (url, params) {
    return new Promise((resolve, reject) => {
        axios
            .post(url, params)
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
};
const axiosGet = function (url, params) {
    return new Promise((resolve, reject) => {
        axios
            .get(url, {
                params,
            })
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
};

// 获取token
async function getToken() {
    const params = {
        grant_type: 'client_credential',
        appid: config.app_id,
        secret: config.app_secret,
    };
    let res = await axiosGet('/weixin/cgi-bin/token', params);
    return res.data.access_token;
}
// 获取天气情况
async function get_weather() {
    const params = {
        openId: "aiuicus",
        clientType: "h5",
        sign: "h5",
        city: config.city
    }
    let res = await axiosGet(`/weather/csp/api/v2.1/weather`, params)
    return res.data.data.list[0]
}

// 获取当前时间：格式 2022年8月25日 星期五
function getCurrentDate() {
    let days = ""
    switch (dayjs().weekday()) { // 当前星期几
        case 1:
            days = '星期一';
            break;
        case 2:
            days = '星期二';
            break;
        case 3:
            days = '星期三';
            break;
        case 4:
            days = '星期四';
            break;
        case 5:
            days = '星期五';
            break;
        case 6:
            days = '星期六';
            break;
        case 0:
            days = '星期日';
            break;
    }
    return dayjs().format('YYYY-MM-DD') + " " + days
}

// 计算生日还有多少天
// function brthDate(brth) {
//   return dayjs(brth).diff(dayjs(), 'day')
// }
function brthDate(brth, islunar) {
    const nowDate = dayjs().format('YYYY-MM-DD'); // 当前日期（格式：年-月-日）
    let birthDays = ""

    // 判断一个日期是否大于等于另一个日期：判断生日 是否大于等于 当前日期（返回布尔值）
    if (dayjs(brth).isSameOrAfter(nowDate)) {
        // 生日还没过
        birthDays = dayjs(brth).diff(dayjs(), 'day') // 获取两个日期相差的天数
        // if (birthDays === 0) console.log("今天是宝贝的生日，生日快乐");
    } else {
        // 生日已过,计算距离下一次生日还有多少天
        let nextBirthYears = dayjs().year() + 1 // 下一次生日年份等于当前年份+1

        let nextBirth = nextBirthYears + "-" + dayjs(brth).format('MM-DD') // 下一次生日年月日
        console.log(nextBirth);

        if (islunar) {
            let [y, m, d] = brth.split('-')

            nextBirth = lunarFun.lunalToGregorian(nextBirthYears, m, d, isRun(nextBirthYears)).slice(0, 3).join('-')
            console.log(nextBirth);
        }
        birthDays = dayjs(nextBirth).diff(dayjs(), 'day') // 获取两个日期相差的天数
    }
    return birthDays
}
function isRun(year) {
    return year % 100 != 0 && year % 4 == 0 || year % 400 == 0
}
function alreadyBorn(birth, islunar) {
    if (islunar) {
        let [y, m, d] = birth.split('-')
        birth = lunarFun.lunalToGregorian(y, m, d, isRun(y))
    }
    return -dayjs(birth).diff(dayjs(), 'day')
}

// 土味情话
async function sweetNothings() {
    let res = await axiosGet("/sweetword/words/api.php?return=json")
    let str = ""
    config.loveStr ? str = config.loveStr : str = res.data.word
    return str.replace(/<br>/g, "\n")
}
// 随机颜色
function randomColor() {
    let randomColor = "#" + parseInt(Math.random() * 0x1000000).toString(16).padStart(6, "0")
    return randomColor
}
function food() {
    return "你猜！"
}

async function templateMessageSend() {
    const token = await getToken();
    const url = '/weixin/cgi-bin/message/template/send?access_token=' + token;
    // 天气信息
    let weatherInfo = await get_weather()
    // 计算在一起的天数
    let together_day = dayjs().diff(config.love_date, "day")
    // 每日情话
    let loveStr = await sweetNothings()
    // 模板id 配置项
    const params = {
        touser: config.user,
        template_id: config.template_id,
        url: '',
        topcolor: '#FF0000',
        data: {
            // 当前日期
            nowDate: {
                value: getCurrentDate(),
                color: randomColor(),
            },
            // 省份
            province: {
                value: weatherInfo.province,
                color: randomColor(),
            },
            // 城市
            city: {
                value: weatherInfo.city,
                color: randomColor(),
            },
            // 天气
            weather: {
                value: weatherInfo.weather,
                color: randomColor(),
            },
            // 当前气温
            temp: {
                value: weatherInfo.temp + "°C",
                color: randomColor(),
            },
            // 最低气温
            low: {
                value: weatherInfo.low + "°C",
                color: randomColor(),
            },
            // 最高气温
            high: {
                value: weatherInfo.high + "°C",
                color: randomColor(),
            },
            // 风向
            wind: {
                value: weatherInfo.wind,
                color: randomColor(),
            },
            // 空气质量
            airQuality: {
                value: weatherInfo.airQuality,
                color: randomColor(),
            },
            // 距离出生多少天
            dearAlreadyBornDay: {
                value: alreadyBorn(config.birthday1.birthday, true),
                color: randomColor()
            },
            myAlreadyBornDay: {
                value: alreadyBorn(config.birthday2.birthday),
                color: randomColor(),
            },
            // 适合吃什么
            provideFood: {
                value: food(),
                color: randomColor(),
            },
            // 适合穿什么
            ootd: {
                value: food(),
                color: randomColor(),
            },
            // 湿度
            humidity: {
                value: weatherInfo.humidity,
                color: randomColor(),
            },
            // 宝贝的名字
            dearName: {
                value: config.birthday1.name,
                color: randomColor(),
            },
            // 我的名字
            myName: {
                value: config.birthday2.name,
                color: randomColor(),
            },
            // 距离宝贝生日
            dearBrthDays: {
                value: brthDate(config.birthday1.birthday, true),
                color: randomColor(),
            },
            // 距离我的生日
            myBrthDays: {
                value: brthDate(config.birthday2.birthday),
                color: randomColor(),
            },
            // 在一起的天数
            loveDays: {
                value: together_day,
                color: randomColor(),
            },
            // 每日情话
            loveWords: {
                value: loveStr,
                color: randomColor(),
            }
        },
    };

    let res = await axiosPost(url, params);
    switch (res.data.errcode) {
        case 40001:
            console.log("推送消息失败,请检查 appId/appSecret 是否正确");
            break
        case 40003:
            console.log("推送消息失败,请检查微信号是否正确");
            break
        case 40037:
            console.log("推送消息失败,请检查模板id是否正确");
            break
        case 0:
            console.log("推送消息成功");
            break
    }
}
// 调用函数，推送模板消息
// templateMessageSend(); // 第一次执行程序时会推送一次消息，如使用定时器
let timer = null
function debounce(cb) {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(() => {
        cb && cb();
        timer = undefined;
    }, 1000);
}
function send() {
    setInterval(() => {
        if (dayjs().hour() === 8 && dayjs().minute() === 0 && dayjs().second() === 0) {
            debounce(() => {
                templateMessageSend()
            });
        }
    }, 900);
}


export default send 