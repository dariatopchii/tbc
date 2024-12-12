import React, { useState, useEffect } from "react";
import { connectToMetaMask, getContractInstance } from "./utils/web3";
import { parseEther, formatEther } from "ethers";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [properties, setProperties] = useState([]); // Список недвижимости
  const [newProperty, setNewProperty] = useState({ cadastralNumber: "", description: "" });
  const [isLoading, setIsLoading] = useState(false); // Индикатор загрузки
  const [isConnecting, setIsConnecting] = useState(false); // Индикатор подключения

  useEffect(() => {
    async function init() {
      try {
        const { account } = await connectToMetaMask();
        setCurrentAccount(account);
      } catch (error) {
        console.error("Ошибка подключения MetaMask:", error);
      }
    }
    init();
  }, []);

  // Функция регистрации недвижимости
  const registerProperty = async () => {
    setIsLoading(true);
    try {
      const contract = await getContractInstance();
      const tx = await contract.registerProperty(
        newProperty.cadastralNumber,
        newProperty.description
      );
      await tx.wait();
      alert("Недвижимость успешно зарегистрирована!");
      fetchProperties();
    } catch (error) {
      console.error("Ошибка регистрации недвижимости:", error);
    }
    setIsLoading(false);
  };

  // Функция получения списка недвижимости
  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const contract = await getContractInstance();
      const propertyCounter = await contract.propertyCounter(); // Получение общего количества недвижимости
  
      if (propertyCounter.toString() === "0") {
        alert("Нет зарегистрированных объектов недвижимости");
        setProperties([]);
        setIsLoading(false);
        return;
      }
  
      const propertiesList = [];
      for (let i = 1; i <= propertyCounter; i++) {
        try {
          const property = await contract.properties(i);
          propertiesList.push({
            id: property.id.toString(),
            cadastralNumber: property.cadastralNumber,
            description: property.description,
            owner: property.owner,
            isForSale: property.isForSale,
            price: property.isForSale ? formatEther(property.price) : null,
          });
        } catch (err) {
          console.error(`Ошибка получения данных объекта ${i}:`, err);
        }
      }
      setProperties(propertiesList);
    } catch (error) {
      console.error("Ошибка получения списка недвижимости:", error);
    }
    setIsLoading(false);
  };
  
  // Функция для выставления недвижимости на продажу
  const listForSale = async (propertyId, price) => {
    setIsLoading(true);
    try {
      const contract = await getContractInstance();
      const tx = await contract.listForSale(propertyId, parseEther(price));
      await tx.wait();
      alert("Объект выставлен на продажу!");
      fetchProperties();
    } catch (error) {
      console.error("Ошибка выставления на продажу:", error);
    }
    setIsLoading(false);
  };

  const handleConnect = async () => {
    if (isConnecting) return; // Предотвращаем повторное нажатие
    setIsConnecting(true);
    try {
      const { account } = await connectToMetaMask();
      setCurrentAccount(account);
    } catch (error) {
      console.error("Ошибка подключения MetaMask:", error);
    }
    setIsConnecting(false);
  };

  return (
    <div>
      <h1>Property Manager DApp</h1>
      {currentAccount ? (
        <div>
          <p>Вы подключены как: {currentAccount}</p>

          <div>
            <h2>Зарегистрировать новую недвижимость</h2>
            <input
              type="text"
              placeholder="Кадастровый номер"
              value={newProperty.cadastralNumber}
              onChange={(e) =>
                setNewProperty({ ...newProperty, cadastralNumber: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Описание объекта"
              value={newProperty.description}
              onChange={(e) =>
                setNewProperty({ ...newProperty, description: e.target.value })
              }
            />
            <button onClick={registerProperty} disabled={isLoading}>
              {isLoading ? "Регистрация..." : "Зарегистрировать"}
            </button>
          </div>

          <div>
            <h2>Список недвижимости</h2>
            <button onClick={fetchProperties} disabled={isLoading}>
              {isLoading ? "Загрузка..." : "Обновить список"}
            </button>
            <ul>
              {properties.map((property) => (
                <li key={property.id}>
                  ID: {property.id}, Кадастровый номер: {property.cadastralNumber}, Описание:{" "}
                  {property.description}, Владелец: {property.owner},{" "}
                  {property.isForSale ? `Цена: ${property.price} ETH` : "Не продается"}{" "}
                  {!property.isForSale && (
                    <button
                      onClick={() => listForSale(property.id, "1")}
                      disabled={isLoading}
                    >
                      Продать за 1 ETH
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? "Подключение..." : "Подключить MetaMask"}
        </button>
      )}
    </div>
  );
}

export default App;
