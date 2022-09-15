<template>
  <div class="container">
    <div class="col" ref="cols" v-for="(col, index) in colData" :key="index">
      <div class="row" :style="{height: row.height}" v-for="(row, i) in col" :key="i">{{row.text}}</div>
    </div>
  </div>
</template>

<script>
const inBrowser = typeof window !== 'undefined' && window !== null
let observerObj;  // 侦听的实例
let minCol = 0; // 高度最小列的索引
let innerData = []; // 瀑布流数据队列
let count = 0; // 已渲染的数量

export default {
  data() {
    return {
      list: [], // 获取的列表数据
      colData: [[],[]],
      firstPageCount: 10, // 首屏渲染的数量
      base: [
        {
          text: "1111",
          height: "100px",
        },
        {
          text: "2222",
          height: "200px",
        },
        {
          text: "3333",
          height: "150px",
        },
        {
          text: "4444",
          height: "400px",
        },
        {
          text: "5555",
          height: "600px",
        },
        {
          text: "6666",
          height: "300px",
        },
        {
          text: "7777",
          height: "350px",
        },
        {
          text: "8888",
          height: "260px",
        },
        {
          text: "9999",
          height: "420px",
        },
        {
          text: "1010",
          height: "200px",
        },
      ],
      renderingList: [],
      maxHeight: 0,  // 最大的元素的垂直偏移量，也就是容器的高度
      isLoading: false, // 是否加载数据中
    }
  },
  watch: {
    list: {
      handler: function(v) {
        innerData = [...innerData, ...v]
        this.waterfall()
      }
    }
  },
  created() {
    const ioPromise = this.checkIntersectionObserver()
    ? Promise.resolve()
    : import('intersection-observer');
    ioPromise.then(() => {
      this.init();
    });
  },
  mounted() {
    this.loadMore();
  },
  methods: {
    checkIntersectionObserver() {
      if (
          inBrowser &&
          'IntersectionObserver' in window &&
          'IntersectionObserverEntry' in window &&
          'intersectionRatio' in window.IntersectionObserverEntry.prototype
        ) {
          // Minimal polyfill for Edge 15's lack of `isIntersecting`
          // See: https://github.com/w3c/IntersectionObserver/issues/211
          if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
            Object.defineProperty(window.IntersectionObserverEntry.prototype, 'isIntersecting', {
              get: function() {
                return this.intersectionRatio > 0
              }
            })
          }
          return true
        }
        return false
    },
    init() {
      observerObj = new IntersectionObserver((entries) => {
        console.log("---", entries);
        for(const entry of entries) {
          const {target, isIntersecting} = entry;
          // console.log("target", target)
          if(isIntersecting) {
            if(innerData.length) {
              this.waterfall(); // 如果还有就继续添加
            } else {
              this.loadMore(); // 渲染完后加载更多
            }
            observerObj.unobserve(target);
          }
        }
      }, {
        rootMargin: "0px 0px 200px 0px"
      })
    },
    loadMore() {
      console.log("loadMore")
      this.list = this.list.concat(this.base);
    },

    updateMinCol() {
      // 并行渲染时，无法获取最小列，只能按列依次渲染
      if (count < this.firstPageCount) {
        minCol = count % 2
        return
      }
      const heightList = this.$refs['cols'].map((item) => item.offsetHeight)
      const minHeight = Math.min(...heightList)
      minCol = heightList.indexOf(minHeight)
    },

    appendColData() {
      const colItem = innerData.shift()
      this.colData[minCol].push(colItem)
    },

    startObserver() {
      // 开始监测新增加的瀑布流元素
      const nodes = this.$refs['cols'][minCol].querySelectorAll('.row')
      const lastNode = nodes[nodes.length - 1]
      observerObj.observe(lastNode)
    },

    waterfall() {
      // 更新瀑布流高度最小列
      this.updateMinCol()
      // 取出数据源中最靠前的一个并添加到瀑布流高度最小的那一列
      this.appendColData()
      // 首屏采用并行渲染，非首屏采用串行渲染
      if (++count < this.firstPageCount) {
        this.$nextTick(() => this.waterfall())
      } else {
        this.$nextTick(() => this.startObserver())
      }
    },

    getMax(arr) {
      let max = arr[0]; 
      for(let i = 0; i < arr.length; i++) {
        if(max < arr[i]) max = arr[i];
      }
      return max;
    },
    getClient() {
      return {
        width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      }
    },
    getScrollTop() {
      return window.pageYOffset || document.documentElement.scrollTop;
    }
  },
}
</script>

<style scoped>
.container {
  display: flex;
  padding: 10px 10px 0;
  align-items: flex-start; /* 这个不能少 */
}
.col {
  flex: 1 1 0;
}
.col + .col {
  margin-left: 10px;
}
.row {
  margin-bottom: 10px;
  box-sizing: border-box;
  border: 2px solid #000;
}
</style>