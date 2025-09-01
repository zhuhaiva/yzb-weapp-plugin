import request from "../script/request";

// 获取技师列表信息
export function viewemployeeApi(data) {
  return request({
    url: `/littleapp/v2/viewemployee.do`,
    data,
  });
}

// 获取更多技师图片
export function employeepicsApi(data) {
  return request({
    url: `/littleapp/v2/employeepics.do`,
    data,
  });
}
