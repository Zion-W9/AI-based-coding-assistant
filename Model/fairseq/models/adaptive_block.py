import torch.nn as nn
from torch import Tensor


class AdaptiveBlock(nn.Module):
    """
    * Identity Function as the MLP Activation
    * Unit Matrix and Zero Matrix for initialization
    We proposed a few options of the adaptive blocks
    0) Residual FC (1 * zero)
    1) MLP (2 * FC) (2 * unit) 44.38 31.76
    2) Residual MLP (2 * zero) 48.84 36.82
    3) Parallel Residual MLP (2 * zero) 48.67 36.62
    4) Serial Residual MLP (2 * zero) 48.52 36.38
    """
    def __init__(self, dim_in: int, type_block: str) -> None:
        super().__init__()

        # self.attn = nn.MultiheadAttention(dim_in, 8)
        # self.mlp = nn.Sequential(
        #     nn.Linear(dim_in, dim_in * 4 // 3),
        #     nn.ReLU(),
        #     nn.Linear(dim_in * 4 // 3, dim_in)
        # )
        # self.norm0 = nn.LayerNorm(dim_in)
        # self.norm1 = nn.LayerNorm(dim_in)
        # nn.init.normal_(self.mlp[0].weight, mean=0, std=dim_in ** -0.5)
        # nn.init.normal_(self.mlp[-1].weight, mean=0, std=dim_in ** -0.5)
        # nn.init.normal_(self.norm0.weight, mean=0, std=dim_in ** -0.5)
        # nn.init.normal_(self.norm1.weight, mean=0, std=dim_in ** -0.5)

        # specify the type_block
        self.type_block = type_block

        # identity initialized FC layer
        self.fc_unit = nn.Linear(dim_in, dim_in, bias=False)
        # self.fc_unit.bias.data.fill_(0)
        nn.init.eye_(self.fc_unit.weight)
        self.fc_unit2 = nn.Linear(dim_in, dim_in, bias=False)
        # self.fc_unit2.bias.data.fill_(0)
        nn.init.eye_(self.fc_unit2.weight)

        # zero-value initialized FC layer
        self.fc_zero = nn.Linear(dim_in, dim_in, bias=False)
        # self.fc_zero.bias.data.fill_(0)
        nn.init.zeros_(self.fc_zero.weight)
        self.fc_zero2 = nn.Linear(dim_in, dim_in, bias=False)
        # self.fc_zero2.bias.data.fill_(0)
        nn.init.zeros_(self.fc_zero2.weight)

    def forward(self, x: Tensor) -> Tensor:
        # Attn Residual Block
        # out, _ = self.attn(x, x, x)
        # x += out
        # x = self.norm0(x)

        # MLP Residual Block
        # out = self.mlp(x)
        # x += out
        # x = self.norm1(x)

        if self.type_block == 'FC0':
            # Residual FC
            out = self.fc_zero(x)
            x += out
        elif self.type_block == 'FC1':
            # MLP (2 * FC)
            x = self.fc_unit(x)
            x = self.fc_unit2(x)
        elif self.type_block == 'FC2':
            # Residual MLP
            out = self.fc_zero(x)
            out = self.fc_zero2(out)
            x += out
        elif self.type_block == 'FC3':
            # Parallel Residual MLP
            out = self.fc_zero(x)
            out = self.fc_zero2(x + out)
            x += out
        elif self.type_block == 'FC4':
            # Serial Residual MLP
            out = self.fc_zero(x)
            x += out
            out = self.fc_zero2(x)
            x += out
        else:
            raise NotImplementedError

        return x
