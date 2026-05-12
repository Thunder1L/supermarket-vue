import request from '@/utils/request'

export function getMyCoupons() {
  return request({ url: '/coupon/my', method: 'get' })
}