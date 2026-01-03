import { h, unref } from 'vue';
import type { App, Plugin } from 'vue';
import {
  NAvatar,
  NBadge,
  NButton,
  NIcon,
  NImage,
  NPopover,
  NTable,
  NTag,
  NTooltip,
  SelectRenderTag,
} from 'naive-ui';
import { EllipsisHorizontalCircleOutline } from '@vicons/ionicons5';
import { PageEnum } from '@/enums/pageEnum';
import { isArray, isJsonString, isNullObject, isObject } from './is/index';
import { cloneDeep } from 'lodash-es';
import { VNode } from 'vue';
import { DictType, useDictStore } from '@/store/modules/dict';
import { fallbackSrc } from '@/utils/hotgo';
import { getFileExt } from '@/utils/urlUtils';

export const renderTooltip = (trigger, content) => {
  return h(NTooltip, null, {
    trigger: () => trigger,
    default: () => content,
  });
};

/**
 * render 图标
 * */
export function renderIcon(icon, props = null) {
  return () => h(NIcon, props, { default: () => h(icon) });
}

/**
 * render new Tag
 * */
const newTagColors = { color: '#f90', textColor: '#fff', borderColor: '#f90' };

export function renderNew(type = 'warning', text = 'New', color: object = newTagColors) {
  return () =>
    h(
      NTag as any,
      {
        type,
        round: true,
        size: 'small',
        color,
      },
      { default: () => text }
    );
}

// render 标记
export function renderBadge(node: VNode) {
  return h(
    NBadge,
    {
      dot: true,
      type: 'info',
    },
    { default: () => node }
  );
}

// render 标签
export const renderTag: SelectRenderTag = ({ option }) => {
  return h(
    NTag,
    {
      type: option.listClass as 'success' | 'warning' | 'error' | 'info' | 'primary' | 'default',
    },
    { default: () => option.label }
  );
};

// renderOptionTag 选项标签
export const renderOptionTag = (type: DictType, value: any) => {
  if (isNullObject(value)) {
    return ``;
  }
  const dict = useDictStore();
  return h(
    NTag,
    {
      style: {
        marginRight: '6px',
      },
      type: dict.getType(type, value),
      bordered: false,
    },
    {
      default: () => dict.getLabel(type, value),
    }
  );
};

// render 图片
export const renderImage = (image: string) => {
  if (!image || image === '') {
    return ``;
  }
  return h(NImage, {
    width: 32,
    height: 32,
    src: image,
    fallbackSrc: fallbackSrc(),
    style: {
      width: '32px',
      height: '32px',
      'max-width': '100%',
      'max-height': '100%',
      'margin-left': '2px',
    },
  });
};

// render 图片组
export const renderImageGroup = (images: any) => {
  if (isJsonString(images)) {
    images = JSON.parse(images);
  }
  if (isNullObject(images) || !isArray(images)) {
    return ``;
  }
  return images.map((image: string) => {
    return renderImage(image);
  });
};

// render 文件
export const renderFile = (file: string) => {
  if (!file || file === '') {
    return ``;
  }
  return h(
    NAvatar,
    {
      size: 'small',
      style: {
        'margin-left': '2px',
      },
    },
    {
      default: () => getFileExt(file),
    }
  );
};

// render 文件组
export const renderFileGroup = (files: any) => {
  if (isJsonString(files)) {
    files = JSON.parse(files);
  }
  if (isNullObject(files) || !isArray(files)) {
    return ``;
  }
  return files.map((file: string) => {
    return renderFile(file);
  });
};

export interface MemberSumma {
  id: number; // 用户ID
  realName: string; // 真实姓名
  username: string; // 用户名
  avatar: string; // 头像
}

// render 操作人摘要
export const renderPopoverMemberSumma = (member: MemberSumma | null | undefined) => {
  if (!member) {
    return '';
  }
  return h(
    NPopover,
    { trigger: 'hover' },
    {
      trigger: () =>
        h(
          NButton,
          {
            size: 'small',
            text: true,
            iconPlacement: 'right',
          },
          { default: () => member.realName, icon: renderIcon(EllipsisHorizontalCircleOutline) }
        ),
      default: () =>
        h(
          NTable,
          {
            props: {
              bordered: false,
              'single-line': false,
              size: 'small',
            },
          },
          [
            h('thead', [
              h('tr', { align: 'center' }, [
                h('th', '用户ID'),
                h('th', '头像'),
                h('th', '姓名'),
                h('th', '用户名'),
              ]),
            ]),
            h('tbody', [
              h('tr', { align: 'center' }, [
                h('td', member.id),
                h('td', h(NAvatar, { src: member.avatar, round: true, size: 'small' })),
                h('td', member.realName),
                h('td', member.username),
              ]),
            ]),
          ]
        ),
    }
  );
};

// render html
export function renderHtmlTooltip(content: string) {
  content = content.replace(/\n/g, '<br>');
  const html = h('p', { id: 'app' }, [
    h('div', {
      innerHTML: content,
    }),
  ]);
  return renderTooltip(html, html);
}

/**
 * 递归组装菜单格式
 */
export function generatorMenu(routerMap: Array<any>) {
  return filterRouter(routerMap).map((item) => {
    const isRoot = isRootRouter(item);
    const info = isRoot ? item.children[0] : item;
    const currentMenu = {
      ...info,
      ...info.meta,
      label: info.meta?.title,
      key: info.name,
      icon: isRoot ? item.meta?.icon : info.meta?.icon,
    };
    // 是否有子菜单，并递归处理
    if (info.children && info.children.length > 0) {
      // Recursion
      currentMenu.children = generatorMenu(info.children);

      // 当生成后子集为空，则删除子集空数组，否则加载时仍为目录格式！
      if (currentMenu.children.length === 0) {
        delete currentMenu.children;
      }
    }
    return currentMenu;
  });
}

/**
 * 混合菜单
 * */
export function generatorMenuMix(routerMap: Array<any>, routerName: string, location: string) {
  const cloneRouterMap = cloneDeep(routerMap);
  const newRouter = filterRouter(cloneRouterMap);
  if (location === 'header') {
    const firstRouter: any[] = [];
    newRouter.forEach((item) => {
      const isRoot = isRootRouter(item);
      const info = isRoot ? item.children[0] : item;
      info.children = undefined;
      const currentMenu = {
        ...info,
        ...info.meta,
        label: info.meta?.title,
        key: info.name,
      };
      firstRouter.push(currentMenu);
    });
    return firstRouter;
  } else {
    return getChildrenRouter(newRouter.filter((item) => item.name === routerName));
  }
}

/**
 * 递归组装子菜单
 * */
export function getChildrenRouter(routerMap: Array<any>) {
  return filterRouter(routerMap).map((item) => {
    const isRoot = isRootRouter(item);
    const info = isRoot ? item.children[0] : item;
    const currentMenu = {
      ...info,
      ...info.meta,
      label: info.meta?.title,
      key: info.name,
    };
    // 是否有子菜单，并递归处理
    if (info.children && info.children.length > 0) {
      // Recursion
      currentMenu.children = getChildrenRouter(info.children);
    }
    return currentMenu;
  });
}

/**
 * 判断根路由 Router
 * */
export function isRootRouter(item) {
  if (item.meta?.alwaysShow != true && item.children?.length === 0) {
    return true;
  }

  // if (item.meta?.alwaysShow != true) {
  //   if (item.children?.length > 0) {
  //     // 如果存在子级。且只要有一个不是隐藏状态的，则判断不是跟路由
  //     for (let i = 0; i < item.children.length; i++) {
  //       if (item.children[i]?.hidden == false) {
  //         return false;
  //       }
  //     }
  //
  //     return true;
  //   }
  // }

  return false;
}

/**
 * 强制根路由转换
 * @param item
 */
export function mandatoryRootConvert(item) {
  if (item.meta?.isRoot === true) {
  }

  // 默认
  return item.children[0];
}

/**
 * 排除Router
 * */
export function filterRouter(routerMap: Array<any>) {
  return routerMap.filter((item) => {
    return (
      (item.meta?.hidden || false) != true &&
      !['/:path(.*)*', '/', PageEnum.REDIRECT, PageEnum.BASE_LOGIN].includes(item.path)
    );
  });
}

export const withInstall = <T>(component: T, alias?: string) => {
  const comp = component as any;
  comp.install = (app: App) => {
    // @ts-ignore
    app.component(comp.name || comp.displayName, component);
    if (alias) {
      app.config.globalProperties[alias] = component;
    }
  };
  return component as T & Plugin;
};

// dynamic use hook props
export function getDynamicProps<T, U>(props: T): Partial<U> {
  const ret: Recordable = {};

  // @ts-ignore
  Object.keys(props).map((key) => {
    ret[key] = unref((props as Recordable)[key]);
  });

  return ret as Partial<U>;
}

export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string;
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key]);
  }
  return src;
}

/**
 * Sums the passed percentage to the R, G or B of a HEX color
 * @param {string} color The color to change
 * @param {number} amount The amount to change the color by
 * @returns {string} The processed part of the color
 */
function addLight(color: string, amount: number) {
  const cc = parseInt(color, 16) + amount;
  const c = cc > 255 ? 255 : cc;
  return c.toString(16).length > 1 ? c.toString(16) : `0${c.toString(16)}`;
}

/**
 * Lightens a 6 char HEX color according to the passed percentage
 * @param {string} color The color to change
 * @param {number} amount The amount to change the color by
 * @returns {string} The processed color represented as HEX
 */
export function lighten(color: string, amount: number) {
  color = color.indexOf('#') >= 0 ? color.substring(1, color.length) : color;
  amount = Math.trunc((255 * amount) / 100);
  return `#${addLight(color.substring(0, 2), amount)}${addLight(
    color.substring(2, 4),
    amount
  )}${addLight(color.substring(4, 6), amount)}`;
}

// Normalize any CSS color string to 6-digit hex (#rrggbb)
export function normalizeToHex(color: string): string {
  if (!color) return '#000000';
  const str = color.trim().toLowerCase();
  // Already hex
  if (str.startsWith('#')) {
    // Expand short hex like #fff to #ffffff
    if (str.length === 4) {
      const r = str[1];
      const g = str[2];
      const b = str[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    // Ensure 6-digit
    if (str.length === 7) return str;
    // Handle 8-digit hex with alpha by dropping alpha
    if (str.length === 9) return `#${str.slice(1, 7)}`;
    return '#000000';
  }

  // rgb/rgba
  const rgbMatch = str.match(/^rgba?\(([^)]+)\)$/);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((p) => p.trim());
    const r = clamp255(parseFloat(parts[0]));
    const g = clamp255(parseFloat(parts[1]));
    const b = clamp255(parseFloat(parts[2]));
    return rgbToHex(r, g, b);
  }

  // hsl/hsla
  const hslMatch = str.match(/^hsla?\(([^)]+)\)$/);
  if (hslMatch) {
    const parts = hslMatch[1].split(',').map((p) => p.trim());
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1].replace('%', '')) / 100;
    const l = parseFloat(parts[2].replace('%', '')) / 100;
    const { r, g, b } = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  }

  // Fallback
  return '#000000';
}

function clamp255(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(255, Math.round(n)));
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (x: number) => x.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0,
    g1 = 0,
    b1 = 0;

  if (hp >= 0 && hp < 1) {
    r1 = c;
    g1 = x;
  } else if (hp >= 1 && hp < 2) {
    r1 = x;
    g1 = c;
  } else if (hp >= 2 && hp < 3) {
    g1 = c;
    b1 = x;
  } else if (hp >= 3 && hp < 4) {
    g1 = x;
    b1 = c;
  } else if (hp >= 4 && hp < 5) {
    r1 = x;
    b1 = c;
  } else if (hp >= 5 && hp < 6) {
    r1 = c;
    b1 = x;
  }

  const m = l - c / 2;
  return {
    r: clamp255((r1 + m) * 255),
    g: clamp255((g1 + m) * 255),
    b: clamp255((b1 + m) * 255),
  };
}

// 获取树的所有节点key
export function getAllExpandKeys(treeData: any): any[] {
  let expandedKeys: any = [];
  const expandKeys = (items: any[]) => {
    items.forEach((item: any) => {
      expandedKeys.push(item.key);
      if (item.children && item.children.length > 0) {
        expandKeys(item.children);
      }
    });
  };

  expandKeys(unref(treeData));

  // 去重并转换为数组
  expandedKeys = Array.from(new Set(expandedKeys));
  return expandedKeys;
}

// 从树中查找指定节点
export function findTreeNode(data: any, key?: string | number, keyField = 'key'): any {
  for (const item of data) {
    if (item[keyField] == key) {
      return item;
    } else {
      if (item.children && item.children.length) {
        const foundItem = findTreeNode(item.children, key);
        if (foundItem) {
          return foundItem;
        }
      }
    }
  }
  return null;
}
