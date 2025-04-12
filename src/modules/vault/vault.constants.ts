export enum VAULT_TRANSACTION_STATUS {
    PENDING = 'PENDING',
    AWAITING = 'AWAITING',
    AWAITING_SUBMIT = 'AWAITING_SUBMIT',
    CONFIRMED = 'CONFIRMED',
    WITHDRAWING = 'WITHDRAWING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export enum VAULT_TRANSACTION_TYPE {
    DEPOSIT = 'DEPOSIT',
    WITHDRAW = 'WITHDRAW',
}

export enum VAULT_PROCESSOR {
    SYNC_DEPOSIT = 'SYNC_DEPOSIT',
    SYNC_WITHDRAW = 'SYNC_WITHDRAW',
}

export enum VAULT_CHAIN_TYPE {
    EVM = 'EVM',
    SOL = 'SOL',
}

export enum VAULT_STATUS {
    IN_REVIEW = 'IN_REVIEW',
    ACTIVE = 'ACTIVE',
    CLOSE = 'CLOSE', // Deposits and trading are disabled
    PAUSE = 'PAUSE', // Pause execute action
}

export enum VAULT_ACTION_STATUS {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export enum VAULT_ACTIVITY_STATUS {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    SUCCESS_L2_APPROVED = 'SUCCESS_L2_APPROVED', //order trading apex  close
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    OPEN = 'OPEN', // Order pending, partially filled
    FILLED = 'FILLED', // Order has been completely filled
    CANCELED = 'CANCELED', //Order is canceled and may have been partially filled.
    EXPIRED = 'EXPIRED', // Order has expired and may have been partially filled.
    UNTRIGGERED = 'UNTRIGGERED', // Order conditions have not been triggered
}

export enum VAULT_ACTIVITY_TYPE {
    STAKING = 'STAKING',
    UNSTAKING = 'UNSTAKING',
    BORROW = 'BORROW',
    REPAY = 'REPAY',
    TRADING = 'TRADING',
    SWAP = 'SWAP',
    BUY = 'BUY',
    SELL = 'SELL',
    ADD_LIQUIDITY = 'ADD_LIQUIDITY',
    REMOVE_LIQUIDITY = 'REMOVE_LIQUIDITY',
}

export enum VAULT_PROTOCOL_STATUS {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export const APEX_TRADING_PAIRS = ['ETH-USDT', 'DOGE-USDT', 'BTC-USDT', 'ETH-BTC', 'BTC-ETH'];
export const APEX_TRADING_SIDE = ['BUY', 'SELL'];
export const APEX_TRADING_TYPE = ['MARKET', 'LIMIT'];

// SPORT, PERPETUAL, FUTURE
export enum APEX_TRADING_TRADE_TYPE {
    SPOT = 'SPOT',
    PERPETUAL = 'PERPETUAL',
}
