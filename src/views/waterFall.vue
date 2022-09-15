<template>
  <div class="container" :style="{height: maxHeight + 'px'}">
    <div class="list-item" ref="items" v-for="(item, index) in list" :key="index" :style="{height: item.height}">{{item.text}}</div>
  </div>
</template>

<script>
const gap = 10;
const inBrowser = typeof window !== 'undefined' && window !== null
export default {
  data() {
    return {
      list: [
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
  created() {},
  mounted() {
    window.onresize = this.waterFall;
    this.waterFall();
    
    const ioPromise = this.checkIntersectionObserver()
    ? Promise.resolve()
    : import('intersection-observer');
    ioPromise.then(() => {
      this.init();
    });
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
      const io = new IntersectionObserver((entries) => {
        console.log("---", entries);
        for(const entry of entries) {
          const {target, isIntersecting} = entry;
          // console.log("target", target)
          if(isIntersecting) {
            io.unobserve(target);
            this.renderingList.shift();
            if(!this.isLoading && this.renderingList.length === 0) {
              this.isLoading = true;
              this.loadMore();
            }
          }
        }
      }, {
        rootMargin: "0px 0px 400px 0px"
      })
      io.observe(this.$refs.items[this.$refs.items.length - 1]);
      this.renderingList.push(1);
    },
    loadMore() {
      console.log("loadMore")
      this.list = this.list.concat(this.base);
      this.$nextTick(() => {
        this.waterFall();
        this.isLoading = false;
      })
    },
    waterFall() {
      console.log("waterFall", this.$refs.items)
      const pageWidth = this.getClient().width;
      const items = this.$refs.items;
      const itemWidth = items[0].offsetWidth;
      const columns = parseInt(pageWidth / (itemWidth + gap));
      let arr = [];
      for(let i = 0; i < items.length; i++) {
        if (i < columns) {
          items[i].style.top = 0;
          items[i].style.left = (itemWidth + gap) * i + 'px';
          arr.push(items[i].offsetHeight);
        } else {
          let minHeight = arr[0];
          let index = 0;
          for(let j = 0; j < arr.length; j++) {
            if (minHeight > arr[j]) {
              minHeight = arr[j];
              index = j;
            }
          }
          items[i].style.top = arr[index] + gap + 'px';
          items[i].style.left = items[index].offsetLeft + 'px';

          arr[index] = arr[index] + items[i].offsetHeight + gap;
        }
      }
      this.maxHeight = this.getMax(arr);
      this.init();
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
  position: relative;
}
.list-item {
  position: absolute;
  box-sizing: border-box;
  width: 140px;
  border: 2px solid #000;
}
</style>