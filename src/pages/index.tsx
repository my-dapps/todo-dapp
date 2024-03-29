import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.scss";
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import Contract from "./../../../todo-truffle/build/contracts/Todo.json";
import ReactDOM from "react-dom";

declare let window: any;

export async function _getContract() {
  if (!window.ethereum) {
    console.log("please install MetaMask");
    return null as any;
  }

  // Creating a new provider
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // MetaMask requires requesting permission to connect users accounts
  const accounts = await provider.send("eth_requestAccounts", []);

  // Getting the signer
  const signer = provider.getSigner();

  // Creating a new contract factory with the signer, address and ABI
  const contract = new ethers.Contract(
    "0xff584df7B4f8765A439395aFB0515A700768aa38",
    Contract.abi,
    signer
  );

  // Returning the contract, provider, signer and accounts.
  return { contract, provider, signer, accounts };
}

export default function Home() {
  const [contract, setContract] = useState<any>(null);
  const [todos, setTodos] = useState<Array<string>>([]);

  const inputRef = useRef<any>();

  useEffect(() => {
    const loadfn = async () => {
      const { contract } = await _getContract();
      const todosData = await contract.getTodos();
      setContract(contract);
      setTodos(todosData);

      contract &&
        contract.on("TodoAdded", (data: any, txn: any, value: any) => {
          inputRef.current.value = "";
          if (value?.event === "TodoAdded") {
            console.log("Added txn", txn, "data", data);
            setTodos([...todos, ...value?.args]);
          }
        });

      contract &&
        contract.on("TodoRemoved", (data: any, txn: any, value: any) => {
          if (value?.event === "TodoRemoved") {
            console.log("Removed txn", txn, "data", data);
            setTodos([...todos, ...value?.args]);
          }
        });
    };
    loadfn();
  }, []);

  const onClickConnect = async () => {
    await contract.addTodo(inputRef?.current?.value);
  };

  const removeTodo = async (index: number) => {
    // await contract.removeTodoByIndex(index);
    ReactDOM.createPortal(
      <div className="modal">
        <span>Hello</span>
        <button>Close</button>
      </div>,
      document.body
    );
  };

  const keyDownFn = (e: any) => {
    if (e.key === "Enter") {
      onClickConnect();
    }
  };

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.banner}></div>
        <div className={styles.container}>
          <h1>DECENTRALIZED TODO</h1>
          <div className={styles.addTodo}>
            <button onClick={onClickConnect}></button>
            <input
              ref={inputRef}
              placeholder="Type in your todo..."
              onKeyDown={keyDownFn}
            />
          </div>
          <div className="divider"></div>
          <div className={styles.displayTodos}>
            <Todos todos={todos} removeTodo={removeTodo} />
          </div>
        </div>
      </main>
    </>
  );
}

function Todos({
  todos,
  removeTodo,
}: {
  todos: Array<string>;
  removeTodo: any;
}) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>();

  const toggleCheck = (i: number) => {
    if (activeIndex === null || activeIndex === undefined) {
      setActiveIndex(i);
      return;
    }

    if (activeIndex === i) {
      setActiveIndex(undefined);
      return;
    }

    setActiveIndex(i);
  };

  const checkboxClassName = (i: number) => {
    return `${styles.checkbox} ${activeIndex === i && styles.active}`;
  };

  return (
    <>
      {todos.filter(Boolean).map((todo, i) => (
        <p className={styles.card} key={todo + Date.now}>
          <div className={styles.namecont}>
            <span
              onClick={() => toggleCheck(i)}
              className={checkboxClassName(i)}
            ></span>
            <span>{todo}</span>
          </div>
          {activeIndex === i && (
            <button
              className={styles.removeTodoButton}
              onClick={() => removeTodo(i)}
            >
              X
            </button>
          )}
        </p>
      ))}
    </>
  );
}
