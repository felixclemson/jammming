export const storeCodeVerifier = (codeVerifier) => {
    localStorage.setItem('code_verifier', codeVerifier)
}

export const getCodeVerifier = () => {
    return localStorage.getItem('code_verifier')
}

export const removeCodeVerifier = () => {
    localStorage.removeItem('code_verifier')
}

export const storeAccessToken = (accessToken) => {
    localStorage.setItem('access_token', accessToken)
}

export const getAccessToken = () => {
    return localStorage.getItem('access_token')
}

export const removeAccessToken = () => {
    localStorage.removeItem('access_token')
}

export const isLoggedIn = () => {
    const accessToken = getAccessToken() 
    return accessToken !== null
  }