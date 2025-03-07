import {
	arbitrum,
	avalanche,
	base,
	baseSepolia,
	Chain,
	linea,
	optimism,
	polygon,
	sepolia,
} from "viem/chains";

import config from "../config";
import ChainIds from "../usecases/schemas/blockchains";

const ZERODEV_API_BASE = "https://rpc.zerodev.app/api/v2";
const getBundlerRpcUrl = (projectId: string) =>
	`${ZERODEV_API_BASE}/bundler/${projectId}`;
const getPaymasterRpcUrl = (projectId: string) =>
	`${ZERODEV_API_BASE}/paymaster/${projectId}`;

enum EChainFeature {
	OFFRAMP = "OFFRAMP",
}

type IChainsType = {
	[chainId: string]: {
		name: string;
		native: string;
		blockExplorer: string;
		rpcUrl: string;
		bundlerRpcUrl: string;
		paymasterRpcUrl: string;
		viemChain: Chain;
		zerodevProjectId: string;
		features: string[];
	};
};

// https://docs.moralis.io/supported-chains
const SUPPORTED_CHAINS: IChainsType = {
	// Mainnets
	[ChainIds.ARBITRUM]: {
		name: "Arbitrum",
		native: "ETH",
		blockExplorer: "https://arbiscan.io",
		rpcUrl: config.arbitrumRpc,
		zerodevProjectId: config.arbitrumZerodevProjectId,
		bundlerRpcUrl: getBundlerRpcUrl(config.arbitrumZerodevProjectId),
		paymasterRpcUrl: getPaymasterRpcUrl(config.arbitrumZerodevProjectId),
		viemChain: arbitrum,
		features: [EChainFeature.OFFRAMP],
	},
	[ChainIds.AVALANCHE]: {
		name: "Avalanche",
		native: "AVAX",
		blockExplorer: "https://snowtrace.io",
		rpcUrl: config.avalancheRpc,
		zerodevProjectId: config.avalancheZerodevProjectId,
		bundlerRpcUrl: getBundlerRpcUrl(config.avalancheZerodevProjectId),
		paymasterRpcUrl: getPaymasterRpcUrl(config.avalancheZerodevProjectId),
		viemChain: avalanche,
		features: [EChainFeature.OFFRAMP],
	},
	[ChainIds.BASE]: {
		name: "Base",
		native: "ETH",
		blockExplorer: "https://basescan.org/",
		rpcUrl: config.baseRpc,
		zerodevProjectId: config.baseZerodevProjectId,
		bundlerRpcUrl: getBundlerRpcUrl(config.baseZerodevProjectId),
		paymasterRpcUrl: getPaymasterRpcUrl(config.baseZerodevProjectId),
		viemChain: base,
		features: [EChainFeature.OFFRAMP],
	},
	[ChainIds.OPTIMISM]: {
		name: "Optimism",
		native: "ETH",
		blockExplorer: "https://optimistic.etherscan.io",
		rpcUrl: config.optimismRpc,
		zerodevProjectId: config.optimismZerodevProjectId,
		bundlerRpcUrl: getBundlerRpcUrl(config.optimismZerodevProjectId),
		paymasterRpcUrl: getPaymasterRpcUrl(config.optimismZerodevProjectId),
		viemChain: optimism,
		features: [EChainFeature.OFFRAMP],
	},
	[ChainIds.POLYGON]: {
		name: "Polygon",
		native: "MATIC",
		blockExplorer: "https://polygonscan.com",
		rpcUrl: config.polygonRpc,
		zerodevProjectId: config.polygonZerodevProjectId,
		bundlerRpcUrl: getBundlerRpcUrl(config.polygonZerodevProjectId),
		paymasterRpcUrl: getPaymasterRpcUrl(config.polygonZerodevProjectId),
		viemChain: polygon,
		features: [EChainFeature.OFFRAMP],
	},
	[ChainIds.LINEA]: {
		name: "LINEA",
		native: "ETH",
		blockExplorer: "https://lineascan.build/",
		rpcUrl: config.lineaRpc,
		zerodevProjectId: config.lineaZerodevProjectId,
		bundlerRpcUrl: getBundlerRpcUrl(config.lineaZerodevProjectId),
		paymasterRpcUrl: getPaymasterRpcUrl(config.lineaZerodevProjectId),
		viemChain: linea,
		features: [],
	},

	// Testnets
	[ChainIds.BASE_SEPOLIA]: {
		name: "Base Sepolia",
		native: "ETH",
		blockExplorer: "https://base-sepolia.blockscout.com",
		rpcUrl: config.baseSepoliaRpc,
		zerodevProjectId: config.baseSepoliaZerodevProjectId,
		bundlerRpcUrl: getBundlerRpcUrl(config.baseSepoliaZerodevProjectId),
		paymasterRpcUrl: getPaymasterRpcUrl(config.baseSepoliaZerodevProjectId),
		viemChain: baseSepolia,
		features: [],
	},
	[ChainIds.SEPOLIA]: {
		name: "Sepolia",
		native: "ETH",
		blockExplorer: "https://sepolia.etherscan.io",
		rpcUrl: config.sepoliaRpc,
		zerodevProjectId: config.sepoliaZerodevProjectId,
		bundlerRpcUrl: getBundlerRpcUrl(config.sepoliaZerodevProjectId),
		paymasterRpcUrl: getPaymasterRpcUrl(config.sepoliaZerodevProjectId),
		viemChain: sepolia,
		features: [],
	},
};

export default SUPPORTED_CHAINS;
