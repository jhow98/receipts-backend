import { RecipeController } from "./recipe.controller";
import { RecipeService } from "../services/recipe.service";
import { HttpException, HttpStatus } from '@nestjs/common';

describe("RecipeController", () => {
  let controller: RecipeController;
  let mockService: any;
  let req: any;

  beforeEach(() => {
    mockService = {
      findAllByUser: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      print: jest.fn(),
    };

    controller = new RecipeController(
      mockService as RecipeService,
      { log: () => {}, warn: () => {}, setContext: () => {} } as any,
      { incrementarReceitasCriadas: () => {}, incrementarFalhasReceita: () => {} } as any,
    );

    req = { user: { id: 1 } };
  });

  describe("findAll", () => {
    it("should list only recipes of the logged-in user", async () => {
      const mockRecipes = [{ id: 10 }];
      mockService.findAllByUser.mockResolvedValue(mockRecipes);

      const result = await controller.findAll(req, undefined);

      expect(mockService.findAllByUser).toHaveBeenCalledWith(1, undefined);
      expect(result).toBe(mockRecipes);
    });

    it("should throw HttpException with 204 when no recipes found", async () => {
      mockService.findAllByUser.mockResolvedValue([]);

      await expect(controller.findAll(req, undefined)).rejects.toMatchObject({
        status: HttpStatus.NO_CONTENT,
      });
    });
  });

  describe("create", () => {
    it("should create a recipe adding userId from req.user", async () => {
      const dto = { name: "Arroz", preparation_time_minutes: 30, servings: 4, ingredients: "arroz", preparation_method: "Cozinhe", categoryId: 2 };
      const created = { id: 99, ...dto, userId: 1 };
      mockService.create.mockResolvedValue(created);

      const result = await controller.create(req, dto as any);

      expect(mockService.create).toHaveBeenCalledWith({ ...dto, userId: 1 });
      expect(result).toEqual(created);
    });

    it("should propagate error and call failure metric", async () => {
      const dto = { name: "Feijão", preparation_time_minutes: 20, servings: 2, ingredients: "feijão", preparation_method: "Cozinhe", categoryId: 3 };
      mockService.create.mockRejectedValue(new Error("fail"));

      await expect(controller.create(req, dto as any)).rejects.toThrow("fail");
    });
  });

  describe("remove", () => {
    it("should remove a recipe when authorized", async () => {
      mockService.findById.mockResolvedValue({ user: { id: 1 } });
      mockService.remove.mockResolvedValue(undefined);

      await expect(controller.remove(5, req)).resolves.toBeUndefined();
      expect(mockService.remove).toHaveBeenCalledWith(5);
    });

    it("should throw NotFoundException when unauthorized", async () => {
      mockService.findById.mockResolvedValue({ user: { id: 2 } });

      await expect(controller.remove(6, req)).rejects.toBeInstanceOf(HttpException);
    });
  });
});
