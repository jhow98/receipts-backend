import { RecipeService } from "./recipe.service";
import { AppLogger } from "../../../common/logger/logger.service";
import { MetricsService } from "../../../common/metrics/metrics.service";

describe("RecipeService", () => {
  let service: RecipeService;
  let repo: any;
  let logger: AppLogger;
  let metrics: MetricsService;

  beforeEach(() => {
    // stub out only the methods we use
    repo = {
      findAllByUser: jest.fn(),
      findById: jest.fn(),
      createAndSave: jest.fn(),
      updateAndGet: jest.fn(),
      delete: jest.fn(),
    };
    logger = new AppLogger({ } as any);
    metrics = { increment: jest.fn() } as any;
    service = new RecipeService(repo as any, logger, metrics);
  });

  it("should list and map recipes by user", async () => {
    const now = new Date();
    const raw = [
      {
        id: 1,
        name: "A",
        preparation_time_minutes: 5,
        servings: 2,
        preparation_method: "x",
        ingredients: "y",
        category: { id: 3 },
        user: { id: 7, name: "Bob" },
        created_at: now,
        updated_at: now,
      },
    ];
    repo.findAllByUser.mockResolvedValue(raw);

    const out = await service.findAllByUser(7); // Chamada correta para findAllByUser

    expect(repo.findAllByUser).toHaveBeenCalledWith(7);
    expect(out).toEqual([
      {
        id: 1,
        name: "A",
        preparation_time_minutes: 5,
        servings: 2,
        preparation_method: "x",
        ingredients: "y",
        category: { id: 3 },
        user: { id: 7, name: "Bob" },
        created_at: now,
        updated_at: now,
      },
    ]);
  });

  it("should remove a recipe", async () => {
    repo.findById.mockResolvedValue({ id: 5 });
    repo.delete.mockResolvedValue(undefined);

    await expect(service.remove(5)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(5);
  });
});