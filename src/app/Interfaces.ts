export interface Direction
{
    name: string;
    x: number;
    y: number;
}

export interface Position
{
    x: number;
    y: number;
}

export interface SnakePart
{
    position: Position;
    direction: Direction;
}

export interface States
{
    direction: Direction;
    speed: number;
}