import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductsService {
    constructor(private repo: Repository<Product>) { }

    findAll() {
        return this.repo.find();
    }

}