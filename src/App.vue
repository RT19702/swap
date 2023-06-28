<template>
  <n-message-provider placement="bottom" :duration="1000">
    <van-nav-bar class="nav-bar">
      <template #left>
        <div class="title">
          <van-icon name="/assets/logo.png" size="40"></van-icon>
        </div>
      </template>
      <template #title>
        <div style="color: #000">SWAP</div>
      </template>
      <template #right>
        <van-tag type="success" round @click="connect">{{ account }}</van-tag>
      </template>
    </van-nav-bar>
    <router-view />
  </n-message-provider>
</template>
<script setup>
import { computed } from "@vue/runtime-core";
import { useWallet, useSwap } from "@/store/swap";

const { connect, wallet } = useWallet();
const { initstatic } = useSwap();
connect();
initstatic();
const account = computed(() => "0x..." + wallet.account.substring(38, 42));
</script>
<style lang="less">
body {
  background: linear-gradient(180deg, rgba(23, 119, 255, 0.29), #f6f6f6 29%);
  color: #fff;
}

#app {
  max-width: 500px;
  margin: 0 auto;
  min-height: 100vh;
}

.n-message-container.n-message-container--bottom {
  bottom: 350px;

  .n-message {
    background-image: linear-gradient(90deg, #c8b2e8, #30c9cd);
    color: #fff;
    border-radius: 20px;
  }
}

.nav-bar {
  --van-nav-bar-background-color: transparent;
  --van-tag-padding: 5px 10px;
  --van-nav-bar-height: 65px;

  .van-tag--success {
    background-image: linear-gradient(90deg, #59d3d4, #719cd9);
  }
}

.van-hairline--bottom:after {
  border: 0;
}

.title {
  display: flex;
  text-align: center;
  align-items: center;

  span {
    margin-left: 10px;
  }

  .search {
    padding: 0;
  }

  ::v-deep(.van-search) {
    padding: 0;
    margin-left: 15px;
  }
}
</style>
