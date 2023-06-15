export const convertAccountsMultiAuthIds = (accounts: string[]): [string, string][] => {
  const accountSet = new Set<string>()
  const accountPairs: [string, string][] = []

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i]
    if (account !== undefined && account !== null) {
      if (!accountSet.has(account)) {
        accountSet.add(account)
        accountPairs.push([account, account])
      }
    }
  }

  return accountPairs
}
