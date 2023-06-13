const { ethers, run, network } = require("hardhat")
require("dotenv").config()

async function main() {
    const oracleAddress = "0xff6906b48708546E169ABEa2C503786CF777C2F5"
    const OracleContractFactory = await ethers.getContractFactory(
        "OracleContract"
    )
    console.log("deploying contract...")
    const oracleContract = await OracleContractFactory.deploy(oracleAddress)
    await oracleContract.deployed()
    console.log(`deploying contract to: ${oracleContract.address}`)

    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block txs....")
        await oracleContract.deployTransaction.wait(6)
        await verify(oracleContract.address, [oracleAddress])
    }
}

async function verify(contractAddress, args) {
    console.log("Verifing contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArgs: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("already verified")
        } else {
            console.log(e)
        }
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
