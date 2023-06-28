<template>
  <div class="content">
    <div class="title">
      <div>
        <n-icon :size="50">
          <img src="/assets/logo.png" style="width: 100%" alt="" />
        </n-icon>
        <div class="title-span">
          <div>兑换</div>
          <div style="font-size: 12px">快速交易通证</div>
        </div>
      </div>
    </div>

    <div class="context">
      <!-- from -->
      <n-card style="
            background: #f8f9fc;
            color: #323233;
            --n-border-color: #fff;
            border-width: 2px;
            border-radius: 15px;
          " v-if="fromCoin">
        <div slot="header" style="display: flex; justify-content: space-between">
          <div style="font-size: 1.2em; font-weight: 700">从</div>
          <n-button round @click="onopen('from')" :class="{ 'animate__animated animate__shakeX': fromflashclass }">
            <img :src="fromCoin.img" alt="" srcset="" style="margin: 0 10px; width: 25px; height: 25px"
              v-if="fromCoin.img" />
            <span style="color: #323233; font-weight: 700">
              {{ fromCoin.name }}<br />
              <span style="font-size: 12px">(***{{ fromCoin.address.substring(38) }})</span>
            </span>
          </n-button>
        </div>

        <n-input-number placeholder="0" v-model:value="frominput" :show-button="false" style="
              text-align: left;
              background: transparent;
              --n-text-color: #323233;
            " :bordered="false" :on-update:value="changeinput" :loading="tooutputloading">
          <template #suffix>
            <div><i @click="changeinput(fromCoinBalanceOf)">Max</i></div>
          </template>
        </n-input-number>
        <div style="text-align: right; font-size: 0.8em; opacity: 0.8">
          ({{ fromCoinBalanceOf }})
        </div>
      </n-card>
      <n-icon :size="25" style="margin: 20px 0" @click="changeBoth">
        <ArrowCircleDown48Filled />
      </n-icon>
      <!-- to -->
      <n-card style="
            background: #f8f9fc;
            color: #323233;
            --n-border-color: #fff;
            border-width: 2px;
            border-radius: 15px;
          " v-if="toCoin">
        <div slot="header" style="display: flex; justify-content: space-between">
          <div style="font-size: 1.2em; font-weight: 700">到</div>
          <n-button round @click="onopen('to')" :class="{ 'animate__animated animate__shakeX': toflashclass }">
            <!-- <n-icon slot="icon" color="#323233" :size="18">
                <ChevronDown12Filled />
              </n-icon> -->
            <template v-if="toCoin">
              <img :src="toCoin.img" alt="" srcset="" style="margin: 0 10px; width: 25px; height: 25px"
                v-if="toCoin.img" />
              <span style="color: #323233; font-weight: 700">
                {{ toCoin.name }}<br />
                <span style="font-size: 12px">(***{{ toCoin.address.substring(38) }})</span>
              </span>
            </template>
            <template v-else> select a token </template>
          </n-button>
        </div>

        <n-input-number placeholder="0" :value="toinput" :show-button="false" style="
              text-align: left;
              background: transparent;
              --n-text-color: #323233;
            " :bordered="false" :loading="toinputloading" :on-update:value="changeoutput">
          <template #suffix>
            <div><i @click="changeoutput(toCoinBalanceOf, true)">Max</i></div>
          </template>
        </n-input-number>
        <div style="text-align: right; font-size: 0.8em; opacity: 0.8">
          ({{ toCoinBalanceOf }})
        </div>
      </n-card>
    </div>
    <n-tag size="large" round :bordered="false" @click="!swapbtndisabled && swap()" style="
          width: 70%;
          color: #fff;
          background-image: linear-gradient(90deg, #59d3d4, #719cd9);
          text-align: center;
          justify-content: center;
          --n-height: 50px;
        " :style="{
          filter: swapbtndisabled ? 'contrast(0.5)' : 'none',
        }">
      <n-spin v-if="swaploading" stroke="#fff"></n-spin>
      <span v-else>兑换</span>
    </n-tag>
  </div>
  <n-modal v-model:show="showModal">
    <n-card style="width: 90%; max-width: 400px; border-radius: 30px" title="Select a token" :bordered="false" size="huge"
      role="dialog" aria-modal="true">
      <n-list clickable hoverable>
        <n-scrollbar style="max-height: 400px">
          <template v-for="(v, i) in selectCoin" :key="i">
            <n-list-item v-if="openType === 'from'
              ? v.only === 'all' || v.only === 'from'
              : v.only === 'all' || v.only === 'to'
              " @click="onselectItem(v)" style="padding: 12px 0" :style="{ opacity: v.disabled ? '0.3' : '1' }">
              <n-thing>
                <div slot="header" style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                    ">
                  <div style="display: flex">
                    <img :src="v.img" alt="" srcset="" width="30" />
                    <div style="
                          margin-left: 10px;
                          font-size: 1.2em;
                          font-weight: 700;
                        ">
                      {{ v.name }}
                    </div>
                  </div>
                  <div>
                    <n-spin v-if="coinStatus">
                      <template #icon>
                        <n-icon :size="20" color="#333">
                          <Reload />
                        </n-icon>
                      </template>
                    </n-spin>

                    <span v-else>{{ div18(v.balanceOf) }}</span>
                  </div>
                </div>
              </n-thing>
            </n-list-item>
          </template>
        </n-scrollbar>
      </n-list>
    </n-card>
  </n-modal>
</template>
<script setup>
import ArrowCircleDown48Filled from "@vicons/fluent/ArrowCircleDown48Filled";
import { Reload } from "@vicons/ionicons5";
import { useMessage } from "naive-ui";
import { computed } from "vue";
import BigNumber from "bignumber.js";
import { useWallet, useSwap } from '@/store/swap';

// 币种选择框
const { wallet } = useWallet();
const { state, getAmountsOut, getAmountsIn, swap: storeSwap } = useSwap();
const message = useMessage();
const account = computed(() => wallet.account);
const showModal = ref(false);
// 禁止兑换
const swapbtndisabled = ref(false);
const frominput = ref(null);
const toinput = ref(null);
const openType = ref("from");
const toinputloading = ref(false);
const tooutputloading = ref(false);
// getAmountIn or getAmountOut;
const getAmountType = ref("out");
// 是否禁止选择
const toflashclass = ref(false);
const fromflashclass = ref(false);
const coins = computed(() => state.coin);
console.log(state)
const selectCoin = computed(() => coins.value);
const fromCoin = computed(() => {
  return coins.value.find((item) => item.type === "from");
});
const toCoin = computed(() => {
  return coins.value.find((item) => item.type === "to");
});
const toCoinBalanceOf = computed(() => {
  return div18(toCoin.value.balanceOf, 6);
});
const fromCoinBalanceOf = computed(() => {
  return div18(fromCoin.value.balanceOf, 6);
});

// 格式化数字
const div18 = (value, fixedNum = 4) => {
  return BigNumber(value).div(1e18).toFixed(fixedNum);
};

// 兑换状态
const swaploading = ref(false);
//打开币种弹窗
const onopen = (type) => {
  openType.value = type;
  showModal.value = true;
};
// 选择币种
const onselectItem = (item) => {
  if (item.disabled) return;
  const hongbaoIndex = coins.value.findIndex((coin) => coin.name === "HONGBAO");
  const yuanIndex = coins.value.findIndex((coin) => coin.name === "YUAN");
  const fromIndex = coins.value.findIndex((coin) => coin.type === "from");
  const toIndex = coins.value.findIndex((coin) => coin.type === "to");
  const selectIndex = coins.value.findIndex(
    (coin) => coin.address === item.address
  );
  if (openType.value === "from") {
    if (toIndex === selectIndex) {
      coins.value[fromIndex].type = "";
      coins.value[toIndex].type = "";
      coins.value[selectIndex].type = "from";
      if (coins.value[selectIndex].name === "YUAN") {
        coins.value[hongbaoIndex].type = "to";
      } else {
        coins.value[yuanIndex].type = "to";
      }
    } else {
      coins.value[fromIndex].type = "";
      coins.value[selectIndex].type = "from";
      if (item.name === "lanbao") {
        message.warning("lanbao只能卖");
        coins.value[toIndex].type = "";
        coins.value[yuanIndex].type = "to";
      }
    }
  } else {
    if (fromIndex === selectIndex) {
      coins.value[fromIndex].type = "";
      coins.value[toIndex].type = "";
      coins.value[selectIndex].type = "to";
      if (coins.value[selectIndex].name === "HONGBAO") {
        coins.value[yuanIndex].type = "from";
      } else {
        coins.value[hongbaoIndex].type = "from";
      }
    } else {
      coins.value[toIndex].type = "";
      coins.value[selectIndex].type = "to";
    }
  }
  showModal.value = false;
};

const resetFromCoin = () => {
  fromCoin.value = coins.value.find(
    (item) => item.address === fromCoin.value.address
  );
};

const swap = async () => {
  if (account.value) {
    if (frominput.value && toinput.value && !swaploading.value) {
      swaploading.value = true;
      try {
        let amountIn = 0;
        // 输入from
        if (getAmountType.value === "out") {
          let value = BigNumber(frominput.value).times(1e18);
          amountIn = value.gt(fromCoin.value.balanceOf)
            ? fromCoin.value.balanceOf
            : value.toFixed(0);
        } else {
          // 输入to
          amountIn = BigNumber(toinput.value).times(1e18).toFixed(0);
        }
        await storeSwap({
          amountIn,
          token0Address: fromCoin.value.address,
          token0Name: fromCoin.value.name,
          token1Address: toCoin.value.address,
          token1Name: toCoin.value.name,
          getAmountType: getAmountType.value,
        });
        message.success("兑换成功");
        setTimeout(() => {
          resetFromCoin();
        }, 1500);
        swaploading.value = false;
      } catch (err) {
        message.error(err || "兑换失败~请重新尝试", {
          duration: 3000,
        });
        console.log("err", err);
        swaploading.value = false;
      }
    }
  } else {
    message.warning("请连接钱包");
  }
};

// 拉去新数据
const runTime = (fn) => {
  let runtimes = setInterval(() => {
    fn();
  }, 3000);
  return runtimes;
};

let runTimesInterval;
const changeBoth = () => {
  if (toCoin.value) {
    if (fromCoin.value.name === "lanbao") {
      fromflashclass.value = true;
      setTimeout(() => {
        fromflashclass.value = false;
      }, 1500);
      return;
    }
    const fromIndex = coins.value.findIndex((coin) => coin.type === "from");
    const toIndex = coins.value.findIndex((coin) => coin.type === "to");
    if (fromIndex !== -1) {
      coins.value[fromIndex].type = "to";
    }
    if (toIndex !== -1) {
      coins.value[toIndex].type = "from";
    }
    frominput.value = null;
    toinput.value = null;
    if (runTimesInterval) {
      clearInterval(runTimesInterval);
    }
  }
};
// getAmountOut
const changeinput = (e) => {
  if (runTimesInterval) {
    clearInterval(runTimesInterval);
  }
  const fn = async () => {
    frominput.value = e;
    getAmountType.value = "out";
    if (toCoin.value && Number(e)) {
      toinputloading.value = true;
      try {
        let value = await getAmountsOut({
          token0Name: fromCoin.value.name,
          token0Amount: BigNumber(e).times(1e18).toFixed(0),
          token0Address: fromCoin.value.address,
          token1Name: toCoin.value.name,
          token1Address: toCoin.value.address,
        });
        toinputloading.value = false;
        toinput.value = BigNumber(value).div(1e18).toFixed(8);
        // 切换兑换按钮可点击态
        swapbtndisabled.value = false;
        if (
          BigNumber(e).times(1e18).gt(fromCoin.value.balanceOf) &&
          !(e.toString() === fromCoinBalanceOf.value)
        ) {
          swapbtndisabled.value = true;
        }
      } catch (err) {
        // 切换兑换按钮禁止可点击态
        swapbtndisabled.value = true;
        toinputloading.value = false;
        message.error("请输入正确兑换数量");
      }
    } else {
      toinput.value = "";
    }
  };
  fn();
  runTimesInterval = runTime(fn);
};

const changeoutput = (e, isMax = false) => {
  if (runTimesInterval) {
    clearInterval(runTimesInterval);
  }
  const fn = async () => {
    toinput.value = e;
    getAmountType.value = "in";
    if (fromCoin.value && Number(e)) {
      tooutputloading.value = true;
      try {
        let value = await getAmountsIn({
          token0Name: toCoin.value.name,
          token0Amount: BigNumber(e).times(1e18).toFixed(0),
          token1Name: fromCoin.value.name,
          token0Address: fromCoin.value.address,
          token1Address: toCoin.value.address,
        });

        tooutputloading.value = false;
        frominput.value = BigNumber(value).div(1e18).toFixed(8);
        // 切换兑换按钮可点击态
        swapbtndisabled.value = false;
        if (BigNumber(value).gt(fromCoin.value.balanceOf) && !isMax) {
          swapbtndisabled.value = true;
        }
      } catch (err) {
        tooutputloading.value = false;
        console.log(err);
        message.error("请输入正确兑换数量");
        // 切换兑换按钮禁止可点击态
        swapbtndisabled.value = true;
      }
    } else {
      frominput.value = "";
    }
  };
  fn();
  runTimesInterval = runTime(fn);
};

</script>
<style lang="less" scoped>
.content {
  background: #fff;
  width: 82%;
  max-width: 100%;
  border-radius: 20px;
  margin: 50px auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #323233;

  .title {
    width: 90%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &>div {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    .title-span {
      margin-left: 20px;
      text-align: left;
    }
  }

  .context {
    width: 100%;
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    ::v-deep(.n-input) {
      background: transparent;
      border-color: transparent;
      color: #323233;

      .n-input__input-el {
        color: #323233;
        font-size: 1.2em;
      }
    }
  }
}

::v-deep(.n-scrollbar-rail__scrollbar) {
  background: transparent !important;
}

::v-deep(.n-spin) {
  height: 20px !important;
  width: 20px !important;
}

// ::v-deep(.n-popover__content) {
//   .n-card__content {
//     padding: 0 !important;
//   }
// }
</style>
  