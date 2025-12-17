export const prepareTransaction = async (web3, method, fromAccount) => {
    try {
      const gasEstimate = await method.estimateGas({ from: fromAccount });
      const gasPrice = await web3.eth.getGasPrice();
      const totalCostWei = BigInt(gasEstimate) * BigInt(gasPrice);
      const totalCostEth = web3.utils.fromWei(totalCostWei.toString(), 'ether');
  
      return {
        success: true,
        gas: gasEstimate,
        eth: parseFloat(totalCostEth).toFixed(6),
        method: method
      };
    } catch (error) {
      // Retornamos el error completo para que el componente use 'depurarErrorBlockchain'
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  };