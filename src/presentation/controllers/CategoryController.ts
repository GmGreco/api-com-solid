import { Request, Response } from "express";
export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
export class CategoryController {
  private mockCategories: Category[] = [
    {
      id: "category-electronics",
      name: "Eletrônicos",
      description:
        "Produtos eletrônicos em geral, incluindo smartphones, laptops e acessórios",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "category-books",
      name: "Livros",
      description: "Livros físicos e digitais de todas as categorias",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "category-clothing",
      name: "Roupas",
      description: "Vestuário masculino e feminino",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "category-consulting",
      name: "Consultoria",
      description: "Serviços de consultoria especializada",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ];
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: {
          categories: this.mockCategories,
          total: this.mockCategories.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      if (!name || !description) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: name, description",
        });
        return;
      }
      const existingCategory = this.mockCategories.find(
        (cat) => cat.name.toLowerCase() === name.toLowerCase()
      );
      if (existingCategory) {
        res.status(400).json({
          success: false,
          error: "Category already exists",
        });
        return;
      }
      const newCategory: Category = {
        id: `category-${Date.now()}`,
        name,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.mockCategories.push(newCategory);
      res.status(201).json({
        success: true,
        data: {
          category: newCategory,
        },
        message: "Category created successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
  async getCategoryProducts(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      if (!id) {
        res.status(400).json({
          success: false,
          error: "Category ID is required",
        });
        return;
      }
      const category = this.mockCategories.find((cat) => cat.id === id);
      if (!category) {
        res.status(404).json({
          success: false,
          error: "Category not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: {
          category: category,
          products: [], 
          total: 0,
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
          },
        },
        message: "This endpoint needs integration with ProductRepository",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
}
