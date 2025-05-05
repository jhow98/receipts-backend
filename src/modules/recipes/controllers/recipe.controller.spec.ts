import { RecipeController } from "./recipe.controller";
import { RecipeService } from "../services/recipe.service";
import { AppLogger } from "../../../common/logger/logger.service";
import { Response } from "express";

describe("RecipeController", () => {
  let controller: RecipeController;
  let mockService: any;
  let req: any;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService = {
      findAllByUser: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      print: jest.fn(),
    };
    controller = new RecipeController(mockService as any);

    req = { user: { id: 1 } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  it("should list only recipes of the logged-in user", async () => {
    const mockRecipes = [{ id: 10 }];
    mockService.findAllByUser.mockResolvedValue(mockRecipes);

    await controller.findAll(req, res as Response);

    expect(mockService.findAllByUser).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockRecipes);
  });

  it("should return 204 when no recipes found", async () => {
    mockService.findAllByUser.mockResolvedValue([]);

    await controller.findAll(req, res as Response);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("should create a recipe adding userId from req.user", async () => {
    const dto = { name: "Arroz", preparation_time_minutes: 30, servings: 4, ingredients: "arroz, água, sal", preparation_method: "Cozinhe com água e sal", categoryId: 2 };
    const created = { id: 99, ...dto, userId: 1 };
    mockService.create.mockResolvedValue(created);

    const result = await controller.create(req, dto);

    expect(mockService.create).toHaveBeenCalledWith({ ...dto, userId: 1 });
    expect(result).toEqual(created);
  });

  it("should remove a recipe", async () => {
    mockService.remove.mockResolvedValue(undefined);

    await expect(controller.remove(5)).resolves.toBeUndefined();
    expect(mockService.remove).toHaveBeenCalledWith(5);
  });
});
