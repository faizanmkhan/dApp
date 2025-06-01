"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  UsernameSearch: () => UsernameSearch,
  useIsUserVerified: () => useIsUserVerified,
  useWaitForTransactionReceipt: () => useWaitForTransactionReceipt
});
module.exports = __toCommonJS(src_exports);

// src/address-book/is-verified.tsx
var import_minikit_js = require("@worldcoin/minikit-js");
var import_react = require("react");
var useIsUserVerified = (walletAddress, rpcUrl) => {
  const [isUserVerified, setIsUserVerified] = (0, import_react.useState)(null);
  const [isLoading, setIsLoading] = (0, import_react.useState)(true);
  const [isError, setIsError] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    const fetchIsUserVerified = async () => {
      try {
        const data = await (0, import_minikit_js.getIsUserVerified)(walletAddress);
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
var import_jsx_runtime = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
var import_react2 = require("react");

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
  const appConfig = (0, import_react2.useMemo)(() => _appConfig, [_appConfig]);
  const [transactionHash, setTransactionHash] = (0, import_react2.useState)(void 0);
  const [receipt, setReceipt] = (0, import_react2.useState)(
    void 0
  );
  const [isLoading, setIsLoading] = (0, import_react2.useState)(false);
  const [isError, setIsError] = (0, import_react2.useState)(false);
  const [error, setError] = (0, import_react2.useState)(void 0);
  const [pollCount, setPollCount] = (0, import_react2.useState)(0);
  const [transactionStatus, setTransactionStatus] = (0, import_react2.useState)(void 0);
  const retrigger = (0, import_react2.useCallback)(() => {
    reset();
    setIsLoading(false);
    setPollCount((count) => count + 1);
  }, []);
  const reset = (0, import_react2.useCallback)(() => {
    setTransactionHash(void 0);
    setReceipt(void 0);
    setIsLoading(false);
    setPollCount(0);
    setIsError(false);
    setError(void 0);
    setTransactionStatus(void 0);
  }, []);
  const fetchStatus = (0, import_react2.useCallback)(async () => {
    return await fetchTransactionHash(appConfig, transactionId);
  }, [appConfig, transactionId]);
  (0, import_react2.useEffect)(() => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UsernameSearch,
  useIsUserVerified,
  useWaitForTransactionReceipt
});
