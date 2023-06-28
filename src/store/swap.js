import config from '../../setting.json'
import erc20Abi from '@/utils/abi/erc20.json';
import routerAbi from '@/utils/abi/ROUTER_PANCAKE.json';
import swapAbi from '@/utils/abi/SWAP_CONTRACT.json';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { defineStore } from 'pinia';
import { reactify } from '@vueuse/core';
import { ref } from 'vue';

export const useWallet = defineStore('mywallet', () => {
    const wallet = ref({
        account: '0x0000000000000000000000000000000000000000'
    });

    const connect = async() => {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{
                chainId: '0x38',
            }]
        });
        await window.ethereum.request({
            method: 'eth_requestAccounts',
        });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const singer = provider.getSigner();
        const account = await singer.getAddress();
        wallet.value.account = account;
        return [provider, singer, account]
    };
    return { wallet, connect };
})
export const useSwap = defineStore('swap', () => {
    const { connect } = useWallet();
    const state = ref({
        coin: config.coins
    })

    const getAmountsOut = async({ token0Name, token0Amount, token0Address, token1Name, token1Address }) => {
        const [provider, singer, account] = await connect();
        const labbao = state.value.coin.find(i => i.name === 'lanbao');
        let ROUTER_PANCAKE = config.ROUTER_PANCAKE;
        const ROUTER_PANCAKE_CONTRACT = new ethers.Contract(ROUTER_PANCAKE, routerAbi, provider);
        let amount
        if ((token0Name === 'YUAN' && token1Name === 'HONGBAO') || (token0Name === 'HONGBAO' && token1Name === 'YUAN')) {
            let pairs = await ROUTER_PANCAKE_CONTRACT.getAmountsOut(token0Amount, [token0Address, labbao.address, token1Address]);
            amount = pairs.length ? pairs[2].toString() : '';
            console.log(pairs[0].toString() / 1e18, pairs[1].toString() / 1e18, pairs[2].toString() / 1e18)
        } else {
            let pairs = await ROUTER_PANCAKE_CONTRACT.getAmountsOut(token0Amount, [token0Address, token1Address]);
            amount = pairs.length ? pairs[1].toString() : '';
        }
        return amount
    };
    const getAmountsIn = async({ token0Name, token0Amount, token1Name, token0Address, token1Address }) => {
        const [provider, singer, account] = await connect();
        let ROUTER_PANCAKE = config.ROUTER_PANCAKE;
        const labbao = state.value.coin.find(i => i.name === 'lanbao');
        const ROUTER_PANCAKE_CONTRACT = new ethers.Contract(ROUTER_PANCAKE, routerAbi, provider);
        let amount
        if ((token0Name === 'YUAN' && token1Name === 'HONGBAO') || (token0Name === 'HONGBAO' && token1Name === 'YUAN')) {
            let pairs = await ROUTER_PANCAKE_CONTRACT.getAmountsIn(token0Amount, [token0Address, labbao.address, token1Address]);
            amount = pairs.length ? pairs[0].toString() : '';
            console.log(pairs[0].toString() / 1e18, pairs[1].toString() / 1e18, pairs[2].toString() / 1e18)
        } else {
            let pairs = await ROUTER_PANCAKE_CONTRACT.getAmountsIn(token0Amount, [token0Address, token1Address]);
            amount = pairs.length ? pairs[0].toString() : '';
        }
        return amount
    };
    const swap = async({ amountIn, token0Address, token1Address, token0Name, token1Name, getAmountType }) => {
        const [provider, singer, account] = await connect();
        const lanbao = state.value.coin.find(i => i.name === 'lanbao');

        let contract = config.SWAP_CONTRACT;
        let isboth = true;
        if (token0Address === lanbao.address || token1Address === lanbao.address) {
            contract = config.ROUTER_PANCAKE
            isboth = false;
        }

        const TOKEN_CONTRACT = new ethers.Contract(token0Address, erc20Abi, provider);

        if (getAmountType === 'in') {
            amountIn = await getAmountsIn({
                token0Name,
                token0Amount: amountIn,
                token1Name,
                token0Address,
                token1Address,
            })
        }
        const allowanceCount = await TOKEN_CONTRACT.allowance(account, contract);
        if (BigNumber(allowanceCount.toString()).lt(amountIn)) {
            let approve_tx = await TOKEN_CONTRACT.connect(singer).approve(contract, '1157920892373161954235709850086879078532699846656405640394575840079131296399');
            await provider.waitForTransaction(approve_tx.hash);
        }
        let tx
        if (isboth) {
            const SWAP_ROUTER_CONTRACT = new ethers.Contract(contract, swapAbi, provider);
            tx = await SWAP_ROUTER_CONTRACT.connect(singer).swap(
                amountIn,
                token0Address,
                token1Address
            )
        } else {
            const SWAP_ROUTER_CONTRACT = new ethers.Contract(contract, routerAbi, provider);
            tx = await SWAP_ROUTER_CONTRACT.connect(singer).swapExactTokensForTokensSupportingFeeOnTransferTokens(
                amountIn,
                0, [token0Address, token1Address],
                account,
                moment().unix().valueOf() + 86400
            )
        }

        await provider.waitForTransaction(tx.hash);
        const { status } = await provider.getTransactionReceipt(tx.hash);
        if (status === 0) {
            return Promise.reject('交易失败，请重试')
        }
        return true;
    };
    const getBalanceOf = async() => {
        const [provider, singer, account] = await connect();
        let pall = [];
        state.value.coin.forEach(item => {
            const Contract = new ethers.Contract(item.address, erc20Abi, provider);
            pall.push(
                Contract.balanceOf(account).then(res => res.toString())
            );
        })
        const balanceOfs = await Promise.all(pall);

        state.value.coin.forEach((item, index) => {
            item.balanceOf = balanceOfs[index]
        })
    };

    const initstatic = async() => {
        await connect();
        setInterval(getBalanceOf, 3000)
        getBalanceOf();
    }
    return { state, initstatic, getAmountsOut, getAmountsIn, swap }
})