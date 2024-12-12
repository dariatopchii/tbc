// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract UkrainianRealEstate {
    struct Property {
        uint256 id;
        string cadastralNumber; // Кадастровый номер
        string description; // Описание объекта
        address owner; // Текущий владелец
        bool isForSale; // Статус продажи
        uint256 price; // Цена продажи
        bool isForRent; // Статус аренды
        uint256 rentPrice; // Цена аренды
        uint256 maxRentDuration; // Максимальный срок аренды (в днях)
    }

    uint256 public propertyCounter;
    mapping(uint256 => Property) public properties;

    event PropertyRegistered(uint256 id, string cadastralNumber, string description, address owner);
    event PropertyListedForSale(uint256 id, uint256 price);
    event PropertyListedForRent(uint256 id, uint256 rentPrice, uint256 maxDuration);
    event PropertyTransferred(uint256 id, address from, address to);
    event PropertyRented(uint256 id, address renter, uint256 duration);

    modifier onlyOwner(uint256 _propertyId) {
        require(properties[_propertyId].owner == msg.sender, "Only the owner can perform this action");
        _;
    }

    function registerProperty(string memory _cadastralNumber, string memory _description) public {
        propertyCounter++;
        properties[propertyCounter] = Property({
            id: propertyCounter,
            cadastralNumber: _cadastralNumber,
            description: _description,
            owner: msg.sender,
            isForSale: false,
            price: 0,
            isForRent: false,
            rentPrice: 0,
            maxRentDuration: 0
        });

        emit PropertyRegistered(propertyCounter, _cadastralNumber, _description, msg.sender);
    }

    function listForSale(uint256 _propertyId, uint256 _price) public onlyOwner(_propertyId) {
        require(_price > 0, "Price must be greater than zero");
        properties[_propertyId].isForSale = true;
        properties[_propertyId].price = _price;

        emit PropertyListedForSale(_propertyId, _price);
    }

    function listForRent(uint256 _propertyId, uint256 _rentPrice, uint256 _maxDuration) public onlyOwner(_propertyId) {
        require(_rentPrice > 0, "Rent price must be greater than zero");
        require(_maxDuration > 0, "Max rent duration must be greater than zero");

        properties[_propertyId].isForRent = true;
        properties[_propertyId].rentPrice = _rentPrice;
        properties[_propertyId].maxRentDuration = _maxDuration;

        emit PropertyListedForRent(_propertyId, _rentPrice, _maxDuration);
    }
}
