import { tgMenus } from '@/view/tg/menu'

const menuList = [
  ...tgMenus
]

export default {
  getMenu: () => {
    return {
      code: 0,
      data: {
        menus: menuList
      },
      msg: '获取菜单成功'
    }
  }
}
