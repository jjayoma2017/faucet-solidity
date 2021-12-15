import './App.css'
import { useCallback, useEffect, useState } from 'react'
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import { loadContract } from './utils/load-contract'

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    isProviderLoaded: false,
    web3: null,
    contract: null,
  })

  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [shouldReload, setShouldReload] = useState(false)

  const canConnectToContract = account && web3Api.contract

  const reloadEffect = useCallback(() => setShouldReload(!shouldReload), [
    shouldReload,
  ])

  const setAccountListener = (provider) => {
    provider.on('accountsChanged', (accounts) => setAccount(accounts[0]))
    provider.on('chainChanged', (accounts) => window.location.reload())
  }

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider()

      if (provider) {
        const contract = await loadContract('Faucet', provider)
        setAccountListener(provider)
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
          isProviderLoaded: true,
        })
      } else {
        setWeb3Api((api) => ({
          ...api,
          isProviderLoaded: true,
        }))
        console.error('Please install metamask')
      }
    }

    loadProvider()
  }, [])

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api
      const balance = await web3.eth.getBalance(contract.address)
      setBalance(web3.utils.fromWei(balance, 'ether'))
    }
    web3Api.contract && loadBalance()
  }, [web3Api, shouldReload])

  useEffect(() => {
    const getAccounts = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])
    }
    web3Api.web3 && getAccounts()
  }, [web3Api.web3])

  const addFunds = useCallback(async () => {
    const { contract, web3 } = web3Api
    await contract.addFunds({
      value: web3.utils.toWei('1', 'ether'),
      from: account,
    })
    reloadEffect()
  }, [account, web3Api, reloadEffect])

  const withdraw = async () => {
    const { contract, web3 } = web3Api
    const amount = web3.utils.toWei('0.1', 'ether')
    await contract.widthdraw(amount, { from: account })
    reloadEffect()
  }

  return (
    <>
      <div className="faucet-wrapper">
        <div className="faucet">
          {web3Api.isProviderLoaded ? (
            <div className="is-flex is-align-items-center">
              <span>
                <strong className="mr-2">Account: </strong>
              </span>

              {account ? (
                <span> {account}</span>
              ) : !web3Api.provider ? (
                <>
                  <div className="notification is-warning is-size-6 is-rounded">
                    Wallet is not detected! {` `}
                    <a
                      target="_blank"
                      href="https://docs.metamask.io"
                      rel="noreferrer"
                    >
                      Install Metamask
                    </a>
                  </div>
                </>
              ) : (
                <button
                  className="button is-small  mr-2"
                  onClick={() =>
                    web3Api.provider.request({ method: 'eth_requestAccounts' })
                  }
                >
                  Connect Wallet
                </button>
              )}
            </div>
          ) : (
            <span>Looking for Web3...</span>
          )}
          <div className="balance-view is-size-2  my-4">
            Current Balance: <strong>{balance}</strong> ETH
          </div>
          {!canConnectToContract && (
            <i className="is-block mb-5">Connect to Ganache</i>
          )}
          <button
            disabled={!canConnectToContract}
            className="button is-primary is-light mr-2"
            onClick={addFunds}
          >
            Donate 1 ETH
          </button>
          <button
            className="button is-link is-light"
            onClick={withdraw}
            disabled={!canConnectToContract}
          >
            Withdraw 0.1 ETH
          </button>
        </div>
      </div>
    </>
  )
}

export default App
