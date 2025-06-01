// src/address-book/is-verified.tsx
import { getIsUserVerified } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";
var useIsUserVerified = (walletAddress, rpcUrl) => {
  const [isUserVerified, setIsUserVerified] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(null);
  useEffect(() => {
    const fetchIsUserVerified = async () => {
      try {
        const data = await getIsUserVerified(walletAddress);
        setIsUserVerified(data);
      } catch (err) {
        setIsError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIsUserVerified();
  }, [walletAddress]);
  return { isUserVerified, isLoading, isError };
};

// src/components/username-search.tsx
import { jsx } from "react/jsx-runtime";
var createDebounce = () => {
  let timeoutId;
  return (fn, delay) => {
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };
};
var DEBOUNCE_DELAY_MS = 300;
var debounce = createDebounce();
var getSearchedUsername = async (username) => {
  const response = await fetch(
    `https://usernames.worldcoin.org/api/v1/search/${username}`
  );
  if (response.status === 200) {
    const json = await response.json();
    return { status: response.status, data: json };
  }
  return { status: response.status, error: "Error fetching data" };
};
var UsernameSearch = ({
  value,
  handleChange,
  setSearchedUsernames,
  className,
  inputProps
}) => {
  const debouncedSearch = debounce(
    async (e) => {
      const username = e.target.value;
      const data = await getSearchedUsername(username);
      setSearchedUsernames(data);
    },
    DEBOUNCE_DELAY_MS
  );
  const onChange = (e) => {
    debouncedSearch(e);
    handleChange(e);
  };
  return /* @__PURE__ */ jsx(
    "input",
    {
      type: "text",
      value,
      onChange,
      className: className || "rounded-md border-black border-2",
      ...inputProps
    }
  );
};

// src/transaction/hooks.ts
import { useCallback, useEffect as useEffect2, useMemo, useState as useState2 } from "react";

// src/transaction/index.ts
async function fetchTransactionHash(appConfig, transactionId) {
  try {
    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${appConfig.app_id}&type=transaction`,
      {
        method: "GET"
      }
    );
    if (!response.ok) {
      const error = await response.json();
      console.log(error);
      throw new Error(`Failed to fetch transaction status: ${error.message}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetching transaction status", error);
    throw new Error("Failed to fetch transaction status");
  }
}

// src/transaction/hooks.ts
function useWaitForTransactionReceipt(options) {
  const {
    client,
    appConfig: _appConfig,
    transactionId,
    confirmations = 1,
    timeout,
    pollingInterval = 1e3
  } = options;
  const appConfig = useMemo(() => _appConfig, [_appConfig]);
  const [transactionHash, setTransactionHash] = useState2(void 0);
  const [receipt, setReceipt] = useState2(
    void 0
  );
  const [isLoading, setIsLoading] = useState2(false);
  const [isError, setIsError] = useState2(false);
  const [error, setError] = useState2(void 0);
  const [pollCount, setPollCount] = useState2(0);
  const [transactionStatus, setTransactionStatus] = useState2(void 0);
  const retrigger = useCallback(() => {
    reset();
    setIsLoading(false);
    setPollCount((count) => count + 1);
  }, []);
  const reset = useCallback(() => {
    setTransactionHash(void 0);
    setReceipt(void 0);
    setIsLoading(false);
    setPollCount(0);
    setIsError(false);
    setError(void 0);
    setTransactionStatus(void 0);
  }, []);
  const fetchStatus = useCallback(async () => {
    return await fetchTransactionHash(appConfig, transactionId);
  }, [appConfig, transactionId]);
  useEffect2(() => {
    if (!transactionId) {
      reset();
      return;
    }
    console.log(
      "[Effect] Running for txId:",
      transactionId,
      "Poll count:",
      pollCount
    );
    const abortController = new AbortController();
    const signal = abortController.signal;
    let timeoutId = null;
    const fetchReceipt = async (hashToWaitFor) => {
      if (signal.aborted) return;
      try {
        const txnReceipt = await client.waitForTransactionReceipt({
          hash: hashToWaitFor,
          confirmations,
          timeout
        });
        if (signal.aborted) return;
        setReceipt(txnReceipt);
        setIsLoading(false);
      } catch (err) {
        if (signal.aborted) return;
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };
    const pollHash = async () => {
      if (signal.aborted) return;
      try {
        if (transactionHash) return;
        if (signal.aborted) return;
        const status = await fetchStatus();
        setTransactionStatus(status);
        if (status.transactionHash) {
          setTransactionHash(status.transactionHash);
          await fetchReceipt(status.transactionHash);
        } else {
          timeoutId = setTimeout(pollHash, pollingInterval);
        }
      } catch (err) {
        if (signal.aborted) return;
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };
    pollHash();
    return () => {
      abortController.abort();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [transactionId]);
  const isSuccess = receipt !== void 0 && receipt.status === "success" || transactionStatus?.transactionStatus === "mined";
  return {
    transactionHash,
    receipt,
    isError,
    isLoading,
    isSuccess,
    error,
    retrigger
  };
}
export {
  UsernameSearch,
  useIsUserVerified,
  useWaitForTransactionReceipt
};
